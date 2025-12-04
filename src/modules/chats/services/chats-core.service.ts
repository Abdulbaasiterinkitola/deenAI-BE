import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Observable, from, mergeMap } from 'rxjs';
import { ChatActionModel } from '../action-models/chat.action-model';
import { ChatMessageActionModel } from '../action-models/chat-message.action-model';
import { ChatsValidationService } from './chats-validation.service';
import { GeminiService } from './gemini.service';
import { Chat } from '../models/chat.model';
import { ChatMessage, MessageRole } from '../models/chat-message.model';
import { SseMessage } from '../types';
import { CustomHttpException } from '@shared/custom.exception';
import { TokenUsageService } from '@modules/token-usage/token-usage.service';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@modules/users/users.service';

/**
 * Core service for chat business logic
 * Handles the main operations for chats and messages
 */
@Injectable()
export class ChatsCoreService {
  private readonly logger = new Logger(ChatsCoreService.name);

  constructor(
    private readonly chatActionModel: ChatActionModel,
    private readonly chatMessageActionModel: ChatMessageActionModel,
    private readonly chatsValidationService: ChatsValidationService,
    private readonly geminiService: GeminiService,
    private readonly tokenUsageService: TokenUsageService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Creates a new chat for a user
   * @param userId - The ID of the user creating the chat
   * @param title - Optional title for the chat
   * @returns The created chat
   */
  async createChat(userId: string, title?: string): Promise<Chat> {
    await this.validateTokenLimit(userId);
    const chat = await this.chatActionModel.create({
      createPayload: {
        userId,
        title: title || null,
        hasTitle: !!title, // Set to true if title is provided, false otherwise
      },
    });

    if (!chat) {
      throw new CustomHttpException(
        'Failed to create chat',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return chat;
  }

  /**
   * Sends a message in a chat and gets AI response
   * @param chatId - The ID of the chat
   * @param userId - The ID of the user sending the message
   * @param messageContent - The message content from the user
   * @returns The user message and AI response
   */
  async sendMessage(
    chatId: string,
    userId: string,
    messageContent: string,
    stream: boolean = false, // Stream functionality
  ): Promise<{
    userMessage: ChatMessage;
    aiMessage: ChatMessage | null;
    usage: {
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
    };
  }> {
    // Validate chat exists and belongs to user
    this.chatsValidationService.validateChatId(chatId);
    this.chatsValidationService.validateMessageContent(messageContent);
    // validate user token limit.
    await this.validateTokenLimit(userId);

    const chat = await this.chatActionModel.get({ id: chatId, userId });
    this.chatsValidationService.validateChatOwnership(chat, userId);

    // Save user message
    const userMessage = await this.chatMessageActionModel.create({
      createPayload: {
        chatId,
        role: MessageRole.USER,
        content: messageContent,
      },
    });

    if (!userMessage) {
      throw new CustomHttpException(
        'Failed to save user message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Get recent messages for context
    const recentMessages = await this.getLastMessages(chatId, 6);

    // If streaming is requested, return early with just the user message
    // The client will then connect to the SSE endpoint to get the AI response
    if (stream) {
      return {
        userMessage,
        aiMessage: null,
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      };
    }

    // Generate AI response
    const { content, references, usage } =
      await this.geminiService.generateResponse(recentMessages, messageContent);

    // Track token usage
    await this.tokenUsageService.trackUsage(userId, usage);

    // Initialize final usage with chat usage
    const finalUsage = { ...usage };

    // Save AI message
    const aiMessage = await this.chatMessageActionModel.create({
      createPayload: {
        chatId,
        role: MessageRole.ASSISTANT,
        content: content,
        aiReferences: references ?? null,
      },
    });

    if (!aiMessage) {
      throw new CustomHttpException(
        'Failed to save AI message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Generate and update title if this is the first message (hasTitle is false)
    if (!chat.hasTitle) {
      try {
        // Generate title and get usage stats
        const { title: generatedTitle, usage: titleUsage } =
          await this.geminiService.generateTitle(messageContent);

        // Track token usage for the title generation
        await this.tokenUsageService.trackUsage(userId, titleUsage);
        // Add title usage to final usage stats
        finalUsage.inputTokens += titleUsage.inputTokens;
        finalUsage.outputTokens += titleUsage.outputTokens;
        finalUsage.totalTokens += titleUsage.totalTokens;

        // Add title usage to final usage stats
        finalUsage.inputTokens += titleUsage.inputTokens;
        finalUsage.outputTokens += titleUsage.outputTokens;
        finalUsage.totalTokens += titleUsage.totalTokens;

        await this.chatActionModel.update({
          updatePayload: {
            title: generatedTitle,
            hasTitle: true,
          },
          identifierOptions: { id: chatId },
        });
      } catch (error) {
        // Log error but don't fail the request if title generation fails
        // The chat will remain without a title and can be updated later
        this.logger.error(
          `Failed to generate title for chat ${chatId}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }

    return {
      userMessage,
      aiMessage,
      usage: finalUsage,
    };
  }

  /**
   * Streams the AI response for a chat.
   * @param chatId - The ID of the chat.
   * @param userId - The ID of the user.
   * @returns An observable for Server-Sent Events.
   */
  streamResponse(chatId: string, userId: string): Observable<SseMessage> {
    // Validate ownership
    const chatPromise = this.chatActionModel
      .get({ id: chatId, userId })
      .then((chat) => {
        this.chatsValidationService.validateChatOwnership(chat, userId);
        return chat;
      });

    return from(chatPromise).pipe(
      mergeMap(async (chat) => {
        const recentMessages = await this.getLastMessages(chatId, 6);
        const latestMessage =
          recentMessages[recentMessages.length - 1] ?? undefined;

        if (!latestMessage || latestMessage.role !== MessageRole.USER) {
          throw new CustomHttpException(
            'No pending user message to respond to',
            HttpStatus.BAD_REQUEST,
          );
        }

        const contextMessages = recentMessages.slice(0, -1);
        const limitedContext = contextMessages.slice(-4);
        const stream = this.geminiService.generateResponseStream(
          limitedContext,
          latestMessage.content,
        );
        const parser = this.geminiService.createContentStreamParser();

        return new Observable<SseMessage>((subscriber) => {
          (async () => {
            let fullResponse = '';
            // Include token usage to the stream response
            let finalUsage = {
              inputTokens: 0,
              outputTokens: 0,
              totalTokens: 0,
            };

            for await (const chunk of stream) {
              fullResponse += chunk.text;
              if (chunk.usage) {
                finalUsage = chunk.usage;
              }
              const readableChunk = parser.consume(chunk.text);

              if (readableChunk) {
                subscriber.next({ data: readableChunk });
              }
            }
            // After streaming, save the full message
            const aiMessage = await this.saveAiMessage(chatId, fullResponse);

            if (aiMessage) {
              // Track usage
              await this.tokenUsageService.trackUsage(userId, finalUsage);

              let chatTitle = chat.title;

              // Generate and update title if this is the first message (hasTitle is false)
              if (!chat.hasTitle) {
                try {
                  // Generate title and get usage stats
                  const { title: generatedTitle, usage: titleUsage } =
                    await this.geminiService.generateTitle(
                      latestMessage.content,
                    );

                  // Track token usage for the title generation
                  await this.tokenUsageService.trackUsage(userId, titleUsage);

                  // Add title usage to final usage stats
                  finalUsage.inputTokens += titleUsage.inputTokens;
                  finalUsage.outputTokens += titleUsage.outputTokens;
                  finalUsage.totalTokens += titleUsage.totalTokens;

                  await this.chatActionModel.update({
                    updatePayload: {
                      title: generatedTitle,
                      hasTitle: true,
                    },
                    identifierOptions: { id: chatId },
                  });

                  chatTitle = generatedTitle;
                } catch (error) {
                  // Log error but don't fail the request if title generation fails
                  this.logger.error(
                    `Failed to generate title for chat ${chatId}: ${
                      error instanceof Error ? error.message : 'Unknown error'
                    }`,
                  );
                }
              }

              const finalResponse = {
                success: true,
                message: 'Message sent successfully',
                data: {
                  userMessage: latestMessage,
                  aiMessage: aiMessage,
                  usage: finalUsage,
                  title: chatTitle,
                },
              };
              subscriber.next({ data: JSON.stringify(finalResponse) });
            }
            subscriber.complete();
          })().catch((err) => subscriber.error(err));
        });
      }),
      mergeMap((obs) => obs), // Flatten the inner observable
    );
  }

  /**
   * Parses and saves the final AI message after streaming is complete.
   * @param chatId - The ID of the chat.
   * @param fullResponse - The complete AI response content.
   */
  async saveAiMessage(
    chatId: string,
    fullResponse: string,
  ): Promise<ChatMessage | null> {
    const parsedResponse = this.geminiService.parseAIResponse(fullResponse);

    return await this.chatMessageActionModel.create({
      createPayload: {
        chatId,
        role: MessageRole.ASSISTANT,
        content: parsedResponse.content,
        aiReferences: parsedResponse.references ?? null,
      },
    });
  }

  /**
   * Gets the last N messages from a chat for context
   * @param chatId - The ID of the chat
   * @param limit - Number of messages to retrieve (default: 4)
   * @returns Array of chat messages
   */
  private async getLastMessages(
    chatId: string,
    limit: number = 4,
  ): Promise<ChatMessage[]> {
    const result = await this.chatMessageActionModel.list({
      filterRecordOptions: { chatId },
      paginationPayload: {
        page: 1,
        limit,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    // Reverse to get chronological order (oldest to newest)
    return result.payload.reverse();
  }

  /**
   * Gets all chats for a user
   * @param userId - The ID of the user
   * @returns Array of chats ordered by most recent first
   */
  async getUserChats(userId: string): Promise<Chat[]> {
    const result = await this.chatActionModel.list({
      filterRecordOptions: { userId },
      paginationPayload: {
        page: 1,
        limit: 100,
      },
      order: {
        updatedAt: 'DESC',
      },
    });

    return result.payload;
  }
  async getChatMessages(
    chatId: string,
    userId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<ChatMessage[]> {
    // Validate ownership first
    const chat = await this.chatActionModel.get({ id: chatId, userId });
    this.chatsValidationService.validateChatOwnership(chat, userId);
    const result = await this.chatMessageActionModel.list({
      filterRecordOptions: { chatId },
      paginationPayload: {
        page,
        limit,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return result.payload;
  }

  /**
   * Deletes a chat and its messages
   * @param chatId - The ID of the chat
   * @param userId - The ID of the user
   */
  async deleteChat(chatId: string, userId: string): Promise<void> {
    const chat = await this.chatActionModel.get({ id: chatId, userId });
    this.chatsValidationService.validateChatOwnership(chat, userId);

    await this.chatActionModel.delete({
      identifierOptions: {
        id: chatId,
        userId,
      },
    });
  }
  async renameChat(
    chatId: string,
    userId: string,
    newTitle: string,
  ): Promise<Chat> {
    const updatedChat = await this.chatActionModel.update({
      updatePayload: {
        title: newTitle,
        hasTitle: !!newTitle,
      },
      identifierOptions: { id: chatId, userId },
    });

    if (!updatedChat) {
      throw new CustomHttpException('Chat not found', HttpStatus.NOT_FOUND);
    }

    return updatedChat;
  }

  // Validates user token limit
  private async validateTokenLimit(userId: string) {
    // Get user to check billing cycle and plan
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new CustomHttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const userPlan = await this.usersService.getUserPlan(userId);

    // Calculate usage for the current billing period
    let billingStart = user.billingStart;

    if (!billingStart) {
      // If billingStart is missing:
      if (userPlan && userPlan.slug !== 'free') {
        // For Premium users
        throw new CustomHttpException(
          'Billing cycle start date is missing for premium user.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      // For Free users: Default to account creation
      billingStart = user.createdAt;
    }

    const monthlyUsage = await this.tokenUsageService.calculateMonthlyUsage(
      userId,
      billingStart,
    );

    if (userPlan) {
      const tokenLimit = userPlan.tokenLimit;

      // Check if token limit is reached
      if (typeof tokenLimit === 'number' && monthlyUsage >= tokenLimit) {
        if (userPlan.slug === 'free') {
          throw new CustomHttpException(
            'Free tier limit reached. Please upgrade your plan to continue using AI chat features.',
            HttpStatus.PAYMENT_REQUIRED,
          );
        } else {
          throw new CustomHttpException(
            'Plan token limit reached. Renew your token quota to continue using AI chat features.',
            HttpStatus.PAYMENT_REQUIRED,
          );
        }
      }
    }
  }
}
