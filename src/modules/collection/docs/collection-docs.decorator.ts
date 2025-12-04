import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import {
  CreateCollectionDto,
  UploadCollectionResponseDto,
} from '../dto/collection.dto';

export function UploadCollectionDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Upload and compress collection files (JSON/XML)',
      description:
        'Uploads one or more collection files, validates them, compresses them using GZIP, and stores metadata in the database.',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: 'Collection files and metadata',
      type: CreateCollectionDto,
    }),
    ApiResponse({
      status: 201,
      description: 'Files uploaded and processed successfully',
      type: [UploadCollectionResponseDto],
    }),
    ApiResponse({ status: 400, description: 'Validation failed' }),
  );
}
