import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Body,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { CollectionService } from './collection.service';
import {
  CreateCollectionDto,
  UploadCollectionResponseDto,
} from './dto/collection.dto';
import { UploadCollectionDocs } from './docs/collection-docs.decorator';
import { SuperadminGuard } from '../../guards/superadmin.guard';

@ApiTags('Collections')
@Controller('collections')
@UseGuards(SuperadminGuard)
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post('upload')
  @UploadCollectionDocs()
  @UseInterceptors(FilesInterceptor('files'))
  async uploadCollection(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() createCollectionDto: CreateCollectionDto,
  ): Promise<UploadCollectionResponseDto[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file must be uploaded');
    }

    return this.collectionService.uploadCollections(files, createCollectionDto);
  }
}
