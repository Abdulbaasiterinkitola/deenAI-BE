import { Injectable } from '@nestjs/common';
import { CollectionsCoreService } from './services/collection-core.service';
import {
  CreateCollectionDto,
  UploadCollectionResponseDto,
} from './dto/collection.dto';

@Injectable()
export class CollectionService {
  constructor(
    private readonly collectionsCoreService: CollectionsCoreService,
  ) {}

  async uploadCollections(
    files: Array<Express.Multer.File>,
    dto: CreateCollectionDto,
  ): Promise<UploadCollectionResponseDto[]> {
    return this.collectionsCoreService.uploadCollections(files, dto);
  }
}
