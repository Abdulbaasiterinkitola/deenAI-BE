import { Injectable } from '@nestjs/common';
import { Bookmark } from '../models/bookmark.model';
import { CustomHttpException } from '@shared/custom.exception';
import { HttpStatus } from '@nestjs/common';

/**
 * Service responsible for validating bookmark-related data and operations
 * Follows the same pattern as other validation services in the project
 */
@Injectable()
export class BookmarksValidationService {
  /**
   * Validates the bookmark ID format
   * @param id - The bookmark ID to validate
   * @throws {CustomHttpException} When ID format is invalid
   */
  validateBookmarkId(id: string): void {
    if (!id) {
      throw new CustomHttpException(
        'Bookmark ID is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (typeof id !== 'string') {
      throw new CustomHttpException(
        'Bookmark ID must be a string',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Basic UUID format validation
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new CustomHttpException(
        'Invalid bookmark ID format',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Validates that a bookmark exists and belongs to the specified user
   * @param bookmark - The bookmark to validate
   * @param userId - The user ID to check ownership against
   * @throws {CustomHttpException} When bookmark doesn't exist or doesn't belong to the user
   */
  validateBookmarkOwnership(
    bookmark: Bookmark | null,
    userId: string,
  ): asserts bookmark is Bookmark {
    if (!bookmark) {
      throw new CustomHttpException('Bookmark not found', HttpStatus.NOT_FOUND);
    }

    if (bookmark.userId !== userId) {
      throw new CustomHttpException(
        'You do not have permission to access this bookmark',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  /**
   * Validates surah and ayah numbers
   * @param surah - The surah number
   * @param ayah - The ayah number
   * @throws {CustomHttpException} When surah or ayah are invalid
   */
  validateSurahAndAyah(surah: number, ayah: number): void {
    if (!Number.isInteger(surah) || surah < 1 || surah > 114) {
      throw new CustomHttpException(
        'Surah must be a number between 1 and 114',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!Number.isInteger(ayah) || ayah < 1) {
      throw new CustomHttpException(
        'Ayah must be a positive integer',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Validates that a bookmark doesn't already exist for the user
   * @param existingBookmark - The existing bookmark if found
   * @throws {CustomHttpException} When bookmark already exists
   */
  validateBookmarkDoesNotExist(existingBookmark: Bookmark | null): void {
    if (existingBookmark) {
      throw new CustomHttpException(
        'Bookmark already exists for this ayah',
        HttpStatus.CONFLICT,
      );
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
        throw new CustomHttpException(
          'Page must be a positive integer',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (limit !== undefined) {
      if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        throw new CustomHttpException(
          'Limit must be between 1 and 100',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }
}
