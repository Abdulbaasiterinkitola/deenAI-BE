import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

export class HealthDocs {
  static tags() {
    return ApiTags('Health Check');
  }

  static check() {
    return applyDecorators(
      ApiOperation({ summary: 'Check server health status' }),

      ApiResponse({
        status: 200,
        description: 'Server is healthy',
        schema: {
          example: {
            status: 'ok',
            services: {
              database: 'up',
              uptime: '300s',
            },
            timestamp: '2025-01-01T12:00:00.000Z',
          },
        },
      }),

      ApiResponse({
        status: 503,
        description: 'Server or database is unhealthy',
        schema: {
          example: {
            status: 'error',
            services: {
              database: 'down',
            },
            timestamp: '2025-01-01T12:00:00.000Z',
          },
        },
      }),
    );
  }
}
