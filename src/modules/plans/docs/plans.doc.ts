import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginationMetaDto } from '@shared/dtos/pagination-meta.dto';
import { PlanResponseDto } from '../dto/plan-response.dto';

export class PlansDocs {
  static tag() {
    return ApiTags('Plans');
  }

  static getAll() {
    return applyDecorators(
      ApiOperation({ summary: 'Get all plans (public)' }),
      ApiQuery({ name: 'page', required: false, example: 1 }),
      ApiQuery({ name: 'limit', required: false, example: 10 }),
      ApiResponse({
        status: 200,
        description: 'Plans retrieved successfully',
        schema: {
          example: {
            success: true,
            status: 'success',
            message: 'Plans retrieved successfully',
            data: {
              items: [PlanResponseDto],
            },
            meta: PaginationMetaDto,
            status_code: 200,
          },
        },
      }),
    );
  }

  static getById() {
    return applyDecorators(
      ApiOperation({ summary: 'Get plan by id (public)' }),
      ApiResponse({
        status: 200,
        description: 'Plan retrieved successfully',
        type: PlanResponseDto,
      }),
      ApiResponse({ status: 404, description: 'Plan not found' }),
    );
  }
}
