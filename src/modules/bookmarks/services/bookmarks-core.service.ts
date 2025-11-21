import { HttpStatus, Injectable } from '@nestjs/common';
import { BookmarksActionModel } from '../action-models/bookmarks.action-model';
import { BookmarksValidationService } from './bookmarks-validation.service';
import { Bookmark } from '../models/bookmark.model';
import {
  BookmarkQueryDto,
  CreateBookmarkDto,
} from '../dtos/bookmark.dto';
import { CustomHttpException } from '@shared/custom.exception';
import { PaginationMeta } from '@shared/helpers/pagination.helper';

/**
 * Core service for bookmark business logic
 * Handles the main operations for bookmarks
 */
@Injectable()
export class BookmarksCoreService {
  constructor(
    private readonly bookmarksActionModel: BookmarksActionModel,
    private readonly bookmarksValidationService: BookmarksValidationService,
  ) {}

  async createBookmark(
    userId: string,
    payload: CreateBookmarkDto,
  ): Promise<Bookmark> {
    this.bookmarksValidationService.validateSurahAndAyah(
      payload.surah,
      payload.ayah,
    );

    const existingBookmark = await this.bookmarksActionModel.get({
      userId,
      surah: payload.surah,
      ayah: payload.ayah,
    });

    this.bookmarksValidationService.validateBookmarkDoesNotExist(
      existingBookmark,
    );

    const bookmark = await this.bookmarksActionModel.create({
      createPayload: {
        userId,
        surah: payload.surah,
        ayah: payload.ayah,
        translation: payload.translation,
        ayahAr: payload.ayahAr,
        translationLanguage: payload.translationLanguage,
      },
    });

    if (!bookmark) {
      throw new CustomHttpException(
        'Failed to create bookmark',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return bookmark;
  }

  async getBookmarks(
    userId: string,
    query: BookmarkQueryDto = {},
  ): Promise<{
    payload: Bookmark[];
    paginationMeta: Partial<PaginationMeta>;
  }> {
    this.bookmarksValidationService.validatePaginationParams(
      query.page,
      query.limit,
    );

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const orderBy = query.orderBy ?? 'DESC';

    return this.bookmarksActionModel.list({
      filterRecordOptions: {
        userId,
      },
      paginationPayload: {
        page,
        limit,
      },
      order: {
        createdAt: orderBy,
      },
    });
  }

  async getBookmarkById(id: string, userId: string): Promise<Bookmark> {
    this.bookmarksValidationService.validateBookmarkId(id);

    const bookmark = await this.bookmarksActionModel.get({ id, userId });

    this.bookmarksValidationService.validateBookmarkOwnership(bookmark, userId);

    return bookmark;
  }

  async deleteBookmark(id: string, userId: string): Promise<void> {
    this.bookmarksValidationService.validateBookmarkId(id);

    const existingBookmark = await this.bookmarksActionModel.get({
      id,
      userId,
    });

    this.bookmarksValidationService.validateBookmarkOwnership(
      existingBookmark,
      userId,
    );

    await this.bookmarksActionModel.delete({
      identifierOptions: { id, userId },
    });
  }
}
