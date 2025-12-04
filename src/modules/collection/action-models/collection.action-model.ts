import { Injectable } from '@nestjs/common';
import { AbstractModelAction } from '@shared/abstract-model-action';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collection } from '../models/collection-model';

@Injectable()
export class CollectionActionModel extends AbstractModelAction<Collection> {
  constructor(
    @InjectRepository(Collection) repository: Repository<Collection>,
  ) {
    super(repository, Collection);
  }
}
