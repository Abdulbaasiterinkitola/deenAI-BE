import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

export class ChatsDocs {
  static getUserChats() {
    return applyDecorators(
      ApiOperation({
        summary: 'Get all user chats',
        description:
          'Retrieves all chats for the authenticated user, ordered by most recent first.',
      }),
      ApiResponse({
        status: 200,
        description: 'Chats retrieved successfully',
        schema: {
          example: {
            success: true,
            message: 'Chats retrieved successfully',
            data: [
              {
                id: 'a7e92c4e-3f21-4a5d-a8ae-57b923f1eac7',
                userId: 'b8f03d5f-4g32-5b6e-b9bf-68c034g2fbd8',
                title: 'Understanding Patience in Islam',
                hasTitle: true,
                createdAt: '2025-01-01T12:00:00.000Z',
                updatedAt: '2025-01-01T12:00:00.000Z',
              },
            ],
          },
        },
      }),
      ApiResponse({
        status: 401,
        description: 'Authentication required',
      }),
    );
  }

  static createChat() {
    return applyDecorators(
      ApiOperation({
        summary: 'Create a new chat',
        description:
          'Creates a new chat for the authenticated user. This endpoint does not accept a request body.',
      }),
      ApiResponse({
        status: 201,
        description: 'Chat successfully created',
        schema: {
          example: {
            success: true,
            message: 'Chat created successfully',
            data: {
              id: 'a7e92c4e-3f21-4a5d-a8ae-57b923f1eac7',
              userId: 'b8f03d5f-4g32-5b6e-b9bf-68c034g2fbd8',
              title: 'Quran Questions',
              hasTitle: true,
              createdAt: '2025-01-01T12:00:00.000Z',
              updatedAt: '2025-01-01T12:00:00.000Z',
            },
          },
        },
      }),
      ApiResponse({
        status: 401,
        description: 'Authentication required',
      }),
    );
  }

  static sendMessage() {
    return applyDecorators(
      ApiParam({
        name: 'id',
        description: 'The unique identifier of the chat',
        example: 'a7e92c4e-3f21-4a5d-a8ae-57b923f1eac7',
      }),
      ApiOperation({
        summary: 'Send a message in a chat',
        description:
          'Sends a message in a chat and receives an AI response. Only the owner of the chat can send messages.',
      }),
      ApiResponse({
        status: 200,
        description: 'Message sent successfully and AI response received',
        schema: {
          example: {
            success: true,
            message: 'Message sent successfully',
            data: {
              userMessage: {
                id: 'c9f13e5f-5h43-6c7f-d0cg-79d145h3gce9',
                chatId: 'a7e92c4e-3f21-4a5d-a8ae-57b923f1eac7',
                role: 'user',
                content: 'What is the meaning of patience in Islam?',
                createdAt: '2025-01-01T12:00:00.000Z',
                updatedAt: '2025-01-01T12:00:00.000Z',
              },
              aiMessage: {
                id: 'd0g24f6g-6i54-7d8g-e1dh-80e256i4hdf0',
                chatId: 'a7e92c4e-3f21-4a5d-a8ae-57b923f1eac7',
                role: 'assistant',
                content: 'Patience (Sabr) in Islam is...',
                aiReferences: [
                  {
                    type: 'quran',
                    surah: 2,
                    startAyah: 153,
                    endAyah: 153,
                  },
                ],
                createdAt: '2025-01-01T12:00:05.000Z',
                updatedAt: '2025-01-01T12:00:05.000Z',
              },
              usage: {
                inputTokens: 50,
                outputTokens: 100,
                totalTokens: 150,
              },
            },
          },
        },
      }),
      ApiResponse({
        status: 400,
        description: 'Validation error',
      }),
      ApiResponse({
        status: 401,
        description: 'Authentication required',
      }),
      ApiResponse({
        status: 403,
        description: 'Access denied - chat belongs to another user',
      }),
      ApiResponse({
        status: 404,
        description: 'Chat not found',
      }),
      ApiResponse({
        status: 402,
        description: 'Payment required - Token limit reached',
      }),
    );
  }
  static getMessages() {
    return applyDecorators(
      ApiOperation({
        summary: 'Get paginated chat messages',
        description: 'Retrieves chat messages in pages of 50',
      }),
      ApiParam({
        name: 'id',
        description: 'Chat ID',
      }),
      ApiQuery({
        name: 'page',
        required: false,
        example: 1,
      }),
      ApiResponse({
        status: 200,
        description: 'Messages retrieved successfully',
      }),
      ApiResponse({
        status: 401,
        description: 'Unauthorized',
      }),
      ApiResponse({
        status: 404,
        description: 'Chat not found',
      }),
    );
  }
}
