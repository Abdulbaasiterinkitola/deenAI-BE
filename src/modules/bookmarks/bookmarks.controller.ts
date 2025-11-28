import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BookmarksService } from './bookmarks.service';
import {
  CreateBookmarkDto,
  BookmarkIdParamDto,
  BookmarkQueryDto,
} from './dtos/bookmark.dto';
import { BookmarksDocs } from './docs/bookmarks.doc';

@ApiTags('Bookmarks')
@ApiBearerAuth()
@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post()
  @BookmarksDocs.createBookmark()
  async createBookmark(
    @Body() payload: CreateBookmarkDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id as string;
    const bookmark = await this.bookmarksService.createBookmark(
      userId,
      payload,
    );

    return {
      message: 'Bookmark created successfully',
      data: bookmark,
    };
  }

  @Get()
  @BookmarksDocs.getBookmarks()
  async getBookmarks(@Query() query: BookmarkQueryDto, @Request() req: any) {
    const userId = req.user?.id as string;
    const result = await this.bookmarksService.getBookmarks(userId, query);

    return {
      message: 'Bookmarks retrieved successfully',
      data: result,
    };
  }

  @Get(':id')
  @BookmarksDocs.getBookmarkById()
  async getBookmarkById(
    @Param() params: BookmarkIdParamDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id as string;
    const bookmark = await this.bookmarksService.getBookmarkById(
      params.id,
      userId,
    );

    return {
      message: 'Bookmark retrieved successfully',
      data: bookmark,
    };
  }

  @Delete(':id')
  @BookmarksDocs.deleteBookmark()
  @HttpCode(204)
  async deleteBookmark(
    @Param() params: BookmarkIdParamDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id as string;
    await this.bookmarksService.deleteBookmark(params.id, userId);
  }
}
