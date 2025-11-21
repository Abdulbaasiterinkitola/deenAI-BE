import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksService } from './bookmarks.service';
import { BookmarksCoreService } from './services/bookmarks-core.service';
import { BookmarksValidationService } from './services/bookmarks-validation.service';
import { BookmarksActionModel } from './action-models/bookmarks.action-model';
import { Bookmark } from './models/bookmark.model';
import { UsersModule } from '@modules/users/users.module';
import { AuthModule } from '@modules/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Bookmark]), UsersModule, AuthModule],
  controllers: [BookmarksController],
  providers: [
    BookmarksService,
    BookmarksCoreService,
    BookmarksValidationService,
    BookmarksActionModel,
  ],
  exports: [BookmarksService],
})
export class BookmarksModule {}
