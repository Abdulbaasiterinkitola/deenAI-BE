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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BookmarksService } from './bookmarks.service';
import {
  CreateBookmarkDto,
  BookmarkIdParamDto,
  BookmarkQueryDto,
} from './dtos/bookmark.dto';
import { AuthGuard } from '@modules/auth/guards/auth.guard';
import { BookmarksDocs } from './docs/bookmarks.doc';

@ApiTags('bookmarks')
@ApiBearerAuth()
@UseGuards(AuthGuard)
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
    return this.bookmarksService.createBookmark(userId, payload);
  }

  @Get()
  @BookmarksDocs.getBookmarks()
  async getBookmarks(@Query() query: BookmarkQueryDto, @Request() req: any) {
    const userId = req.user?.id as string;
    return this.bookmarksService.getBookmarks(userId, query);
  }

  @Get(':id')
  @BookmarksDocs.getBookmarkById()
  async getBookmarkById(
    @Param() params: BookmarkIdParamDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id as string;
    return this.bookmarksService.getBookmarkById(params.id, userId);
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
