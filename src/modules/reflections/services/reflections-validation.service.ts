import { Injectable } from '@nestjs/common';
import { Reflection } from '../models/reflection.model';
import { CustomHttpException } from '@shared/custom.exception';
import { HttpStatus } from '@nestjs/common';

/**
 * Service responsible for validating reflection-related data and operations
 * Follows the same pattern as other validation services in the project
 */
@Injectable()
export class ReflectionsValidationService {
  /**
   * Validates the content of a reflection
   * @param content - The reflection content to validate
   * @throws {CustomHttpException} When content is invalid
   */
  validateReflectionContent(content: string): void {
    if (!content) {
      throw new CustomHttpException('Reflection content is required', HttpStatus.BAD_REQUEST);
    }

    if (typeof content !== 'string') {
      throw new CustomHttpException('Reflection content must be a string', HttpStatus.BAD_REQUEST);
    }

    if (content.trim().length === 0) {
      throw new CustomHttpException('Reflection content cannot be empty', HttpStatus.BAD_REQUEST);
    }

    if (content.length > 10000) {
      throw new CustomHttpException(
        'Reflection content cannot exceed 10,000 characters',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Validates that a reflection exists and belongs to the specified user
   * @param reflection - The reflection to validate
   * @param userId - The user ID to check ownership against
   * @throws {CustomHttpException} When reflection doesn't exist or doesn't belong to the user
   */
  validateReflectionOwnership(reflection: Reflection | null, userId: string): asserts reflection is Reflection {
    if (!reflection) {
      throw new CustomHttpException('Reflection not found', HttpStatus.NOT_FOUND);
    }

    if (reflection.userId !== userId) {
      throw new CustomHttpException(
        'You do not have permission to access this reflection',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  /**
   * Validates the reflection ID format
   * @param id - The reflection ID to validate
   * @throws {CustomHttpException} When ID format is invalid
   */
  validateReflectionId(id: string): void {
    if (!id) {
      throw new CustomHttpException('Reflection ID is required', HttpStatus.BAD_REQUEST);
    }

    if (typeof id !== 'string') {
      throw new CustomHttpException('Reflection ID must be a string', HttpStatus.BAD_REQUEST);
    }

    // Basic UUID format validation (simplified)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new CustomHttpException('Invalid reflection ID format', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Validates pagination parameters
   * @param page - The page number
   * @param limit - The number of items per page
   * @throws {CustomHttpException} When pagination parameters are invalid
   */
  validatePaginationParams(page?: number, limit?: number): void {
    if (page !== undefined) {
      if (!Number.isInteger(page) || page < 1) {
        throw new CustomHttpException('Page must be a positive integer', HttpStatus.BAD_REQUEST);
      }
    }

    if (limit !== undefined) {
      if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        throw new CustomHttpException('Limit must be between 1 and 100', HttpStatus.BAD_REQUEST);
      }
    }
  }
}