import { applyDecorators, Type } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DocsResponseDto } from '@shared/docs-response.dto';
import { PaginatedBookmarksResponseDto } from '../dtos/bookmark.dto';

export class BookmarksDocs {
  static createBookmark() {
    return applyDecorators(
      ApiOperation({ summary: 'Create a bookmark for an ayah' }),
      ApiResponse({
        status: 201,
        description: 'Bookmark created successfully',
        schema: {
          example: {
            success: true,
            status: 'success',
            message: 'Bookmark created successfully',
            data: {
              id: '9f83b7c8-1b23-4d56-9471-8a0c2d55b123',
              userId: 'd1b5e1c2-34a5-4f9e-a8d7-9c2b1a3f4e56',
              surah: 2,
              ayah: 255,
              translation:
                'Allah – there is no deity except Him, the Ever-Living, the Sustainer of existence.',
              translationLanguage: 'en',
              ayahAr: 'اللَّهُ لَا إِلَـٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
              createdAt: '2025-01-01T12:00:00.000Z',
              updatedAt: '2025-01-01T12:00:00.000Z',
            },
            status_code: 201,
          },
        },
      }),
    );
  }

  static getBookmarks() {
    return applyDecorators(
      ApiOperation({ summary: 'Retrieve all bookmarks for the user' }),
      ApiResponse({
        status: 200,
        description: 'Bookmarks retrieved successfully',
        type: DocsResponseDto<PaginatedBookmarksResponseDto>(
          PaginatedBookmarksResponseDto as Type<PaginatedBookmarksResponseDto>,
        ),
      }),
    );
  }

  static getBookmarkById() {
    return applyDecorators(
      ApiOperation({ summary: 'Retrieve a bookmark by id' }),
      ApiResponse({
        status: 200,
        description: 'Bookmark retrieved successfully',
        schema: {
          example: {
            success: true,
            status: 'success',
            message: 'Bookmark retrieved successfully',
            data: {
              id: '9f83b7c8-1b23-4d56-9471-8a0c2d55b123',
              userId: 'd1b5e1c2-34a5-4f9e-a8d7-9c2b1a3f4e56',
              surah: 36,
              ayah: 58,
              translation: '“Peace!”—a word from a Merciful Lord.',
              translationLanguage: 'en',
              ayahAr: 'سَلَامٌ قَوْلًا مِنْ رَبٍّ رَحِيمٍ',
              createdAt: '2025-01-01T12:00:00.000Z',
              updatedAt: '2025-01-01T12:00:00.000Z',
            },
            status_code: 200,
          },
        },
      }),
    );
  }

  static deleteBookmark() {
    return applyDecorators(
      ApiOperation({ summary: 'Remove a bookmark' }),
      ApiResponse({
        status: 204,
        description: 'Bookmark removed successfully',
      }),
    );
  }
}
