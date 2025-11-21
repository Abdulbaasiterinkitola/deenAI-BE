import { Injectable } from '@nestjs/common';
import { AbstractModelAction } from '@shared/abstract-model-action';
import { Bookmark } from '../models/bookmark.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BookmarksActionModel extends AbstractModelAction<Bookmark> {
  constructor(
    @InjectRepository(Bookmark)
    repository: Repository<Bookmark>,
  ) {
    super(repository, Bookmark);
  }
}
