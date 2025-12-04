import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export class SuperadminStatsDocs {
  static getOverview() {
    return applyDecorators(
      ApiOperation({
        summary: 'Get platform overview statistics',
        description:
          'Retrieves general platform overview statistics including total users, active users, paused users, new users in the last 7/30 days, and status breakdown. Requires superadmin privileges.',
      }),
      ApiResponse({
        status: 200,
        description: 'Platform overview statistics retrieved successfully',
        schema: {
          example: {
            success: true,
            status: 'success',
            message: 'Platform overview statistics retrieved successfully',
            data: {
              totalUsers: 160,
              activeUsers: 150,
              pausedUsers: 10,
              newUsersLast7Days: 25,
              newUsersLast30Days: 85,
              statusBreakdown: {
                active: 150,
                paused: 10,
              },
            },
            status_code: 200,
          },
        },
      }),
      ApiResponse({
        status: 401,
        description: 'Unauthorized - Authentication required',
        schema: {
          example: {
            success: false,
            status: 'error',
            message: 'Unauthorized',
            status_code: 401,
          },
        },
      }),
      ApiResponse({
        status: 403,
        description: 'Forbidden - Superadmin privileges required',
        schema: {
          example: {
            success: false,
            status: 'error',
            message: 'Access forbidden',
            status_code: 403,
          },
        },
      }),
      ApiResponse({
        status: 500,
        description: 'Internal server error',
        schema: {
          example: {
            success: false,
            status: 'error',
            message: 'Internal server error',
            status_code: 500,
          },
        },
      }),
    );
  }
}
