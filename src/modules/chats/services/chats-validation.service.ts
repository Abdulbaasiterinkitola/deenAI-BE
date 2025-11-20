import { Injectable, HttpStatus } from '@nestjs/common';
import { Chat } from '../models/chat.model';
import { CustomHttpException } from '@shared/custom.exception';

/**
 * Service responsible for validating chat-related data and operations
 */
@Injectable()
export class ChatsValidationService {
  /**
   * Validates the message content
   * @param message - The message content to validate
   * @throws {CustomHttpException} When message is invalid
   */
  validateMessageContent(message: string): void {
    if (!message) {
      throw new CustomHttpException(
        'Message content is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (typeof message !== 'string') {
      throw new CustomHttpException(
        'Message content must be a string',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (message.trim().length === 0) {
      throw new CustomHttpException(
        'Message content cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (message.length > 5000) {
      throw new CustomHttpException(
        'Message content cannot exceed 5000 characters',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Validates that a chat exists and belongs to the specified user
   * @param chat - The chat to validate
   * @param userId - The user ID to check ownership against
   * @throws {CustomHttpException} When chat doesn't exist or doesn't belong to the user
   */
  validateChatOwnership(
    chat: Chat | null,
    userId: string,
  ): asserts chat is Chat {
    if (!chat) {
      throw new CustomHttpException('Chat not found', HttpStatus.NOT_FOUND);
    }

    if (chat.userId !== userId) {
      throw new CustomHttpException(
        'You do not have permission to access this chat',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  /**
   * Validates the chat ID format
   * @param id - The chat ID to validate
   * @throws {CustomHttpException} When ID format is invalid
   */
  validateChatId(id: string): void {
    if (!id) {
      throw new CustomHttpException(
        'Chat ID is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (typeof id !== 'string') {
      throw new CustomHttpException(
        'Chat ID must be a string',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Basic UUID format validation
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new CustomHttpException(
        'Invalid chat ID format',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
