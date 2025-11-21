import { Injectable } from '@nestjs/common';
import { BookmarksCoreService } from './services/bookmarks-core.service';
import { Bookmark } from './models/bookmark.model';
import { CreateBookmarkDto, BookmarkQueryDto } from './dtos/bookmark.dto';
import { PaginationMeta } from '@shared/helpers/pagination.helper';

/**
 * Service for handling bookmark operations
 * Acts as a facade for the core service and handles business logic
 */
@Injectable()
export class BookmarksService {
  constructor(private readonly bookmarksCoreService: BookmarksCoreService) {}

  /**
   * Creates a new bookmark for a user
   * @param userId - The ID of the user creating the bookmark
   * @param payload - The bookmark data to create
   * @returns The created bookmark
   */
  async createBookmark(
    userId: string,
    payload: CreateBookmarkDto,
  ): Promise<Bookmark> {
    return this.bookmarksCoreService.createBookmark(userId, payload);
  }

  /**
   * Retrieves all bookmarks for a specific user
   * @param userId - The ID of the user
   * @returns List of bookmarks
   */
  async getBookmarks(
    userId: string,
    query: BookmarkQueryDto = {},
  ): Promise<{
    payload: Bookmark[];
    paginationMeta: Partial<PaginationMeta>;
  }> {
    return this.bookmarksCoreService.getBookmarks(userId, query);
  }

  /**
   * Retrieves a bookmark by its ID, ensuring it belongs to the specified user
   * @param id - The ID of the bookmark to retrieve
   * @param userId - The ID of the user requesting the bookmark
   * @returns The bookmark if found and belongs to the user
   */
  async getBookmarkById(id: string, userId: string): Promise<Bookmark> {
    return this.bookmarksCoreService.getBookmarkById(id, userId);
  }

  /**
   * Deletes a bookmark, ensuring it belongs to the specified user
   * @param id - The ID of the bookmark to delete
   * @param userId - The ID of the user deleting the bookmark
   */
  async deleteBookmark(id: string, userId: string): Promise<void> {
    return this.bookmarksCoreService.deleteBookmark(id, userId);
  }
}
