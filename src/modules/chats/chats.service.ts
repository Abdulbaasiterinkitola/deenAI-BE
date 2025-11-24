import { Injectable } from '@nestjs/common';
import { ChatsCoreService } from './services/chats-core.service';
import { Chat } from './models/chat.model';
import { ChatMessage } from './models/chat-message.model';

/**
 * Service for handling chat operations
 * Acts as a facade for the core service and handles business logic
 */
@Injectable()
export class ChatsService {
  constructor(private readonly chatsCoreService: ChatsCoreService) {}

  /**
   * Creates a new chat for a user
   * @param userId - The ID of the user creating the chat
   * @param title - Optional title for the chat
   * @returns Formatted response with the created chat
   */
  async createChat(
    userId: string,
    title?: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: Chat;
  }> {
    const chat = await this.chatsCoreService.createChat(userId, title);
    return {
      success: true,
      message: 'Chat created successfully',
      data: chat,
    };
  }

  /**
   * Sends a message in a chat and gets AI response
   * @param chatId - The ID of the chat
   * @param userId - The ID of the user sending the message
   * @param messageContent - The message content from the user
   * @returns Formatted response with the user message and AI response
   */
  async sendMessage(
    chatId: string,
    userId: string,
    messageContent: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      userMessage: ChatMessage;
      aiMessage: ChatMessage;
    };
  }> {
    const result = await this.chatsCoreService.sendMessage(
      chatId,
      userId,
      messageContent,
    );
    return {
      success: true,
      message: 'Message sent successfully',
      data: result,
    };
  }

  /**
   * Gets all chats for a user
   * @param userId - The ID of the user
   * @returns Formatted response with array of chats ordered by most recent first
   */
  async getUserChats(userId: string): Promise<{
    success: boolean;
    message: string;
    data: Chat[];
  }> {
    const chats = await this.chatsCoreService.getUserChats(userId);
    return {
      success: true,
      message: 'Chats retrieved successfully',
      data: chats,
    };
  }
  async getChatMessages(
    chatId: string,
    userId: string,
    page: number,
    limit: number,
  ): Promise<{
    success: boolean;
    message: string;
    data: ChatMessage[];
  }> {
    const messages = await this.chatsCoreService.getChatMessages(
      chatId,
      userId,
      page,
      limit,
    );

    return {
      success: true,
      message: 'Messages retrieved successfully',
      data: messages,
    };
  }
}
