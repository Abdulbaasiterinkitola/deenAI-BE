import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

export class TokenStatsDocs {
  static overview() {
    return applyDecorators(
      ApiOperation({ summary: 'Overview token stats' }),
      ApiResponse({
        status: 200,
        description: 'Overview statistics for token usage',
        schema: {
          example: {
            totalAllTime: 12345678,
            totalLast7Days: 123456,
            totalLast30Days: 456789,
            averagePerUser: 1234,
            inputTokens: 6000000,
            outputTokens: 6345678,
          },
        },
      }),
    );
  }

  static usage() {
    return applyDecorators(
      ApiOperation({ summary: 'Token usage trends (time series)' }),
      ApiQuery({ name: 'period', required: false, example: 'day' }),
      ApiQuery({ name: 'startDate', required: false, example: '2025-10-01' }),
      ApiQuery({ name: 'endDate', required: false, example: '2025-11-01' }),
      ApiResponse({
        status: 200,
        description: 'Time series points',
      }),
    );
  }

  static topUsers() {
    return applyDecorators(
      ApiOperation({ summary: 'Top users by token consumption' }),
      ApiQuery({ name: 'limit', required: false, example: 10 }),
      ApiQuery({ name: 'period', required: false, example: '30d' }),
      ApiResponse({ status: 200, description: 'Top users' }),
    );
  }

  static breakdown() {
    return applyDecorators(
      ApiOperation({ summary: 'Token breakdown' }),
      ApiResponse({
        status: 200,
        description: 'Input vs output breakdown and averages',
      }),
    );
  }

  static plans() {
    return applyDecorators(
      ApiOperation({ summary: 'Token usage by plan' }),
      ApiResponse({
        status: 200,
        description: 'Token usage aggregated by plan',
      }),
    );
  }

  static userDetail() {
    return applyDecorators(
      ApiOperation({ summary: 'Detailed token stats for a user' }),
      ApiResponse({ status: 200, description: 'Detailed user token usage' }),
    );
  }

  static timeSeries() {
    return applyDecorators(
      ApiOperation({ summary: 'Time series token consumption (for charts)' }),
      ApiResponse({ status: 200, description: 'Time series data points' }),
    );
  }
}
