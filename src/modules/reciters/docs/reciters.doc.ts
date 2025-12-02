import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginationMetaDto } from '@shared/dtos/pagination-meta.dto';
import { ReciterResponseDto } from '../dtos/reciter-response.dto';

export class RecitersDocs {
  static tag() {
    return ApiTags('Reciters');
  }

  static getAll() {
    return applyDecorators(
      ApiOperation({ summary: 'Get all reciters (public)' }),

      ApiQuery({ name: 'page', required: false, example: 1 }),
      ApiQuery({ name: 'limit', required: false, example: 10 }),
      ApiQuery({ name: 'reciterName', required: false, example: 'Mishary Alafasy' }),
      ApiQuery({ name: 'surah', required: false, example: 'Al-Fatihah' }),
      ApiQuery({ name: 'startAyah', required: false, example: 1 }),
      ApiQuery({ name: 'endAyah', required: false, example: 7 }),

      ApiResponse({
        status: 200,
        description: 'Reciters retrieved successfully',
        schema: {
          example: {
            success: true,
            status: 'success',
            message: 'Reciters fetched successfully',
            data: {
              items: [ReciterResponseDto],
            },
            meta: PaginationMetaDto,
            status_code: 200,
          },
        },
      }),
    );
  }

  static upload() {
    return applyDecorators(
      ApiOperation({ summary: 'Upload reciter audio (Admin only)' }),
      ApiResponse({
        status: 201,
        description: 'Reciter uploaded successfully',
        type: ReciterResponseDto,
      }),
      ApiResponse({ status: 400, description: 'Invalid file or bad request' }),
      ApiResponse({ status: 403, description: 'Forbidden (Admin only)' }),
    );
  }

  static download() {
    return applyDecorators(
      ApiOperation({ summary: 'Download or stream reciter audio (public)' }),
      ApiResponse({
        status: 200,
        description: 'Audio stream returned successfully',
      }),
      ApiResponse({ status: 404, description: 'Reciter not found' }),
    );
  }
}
