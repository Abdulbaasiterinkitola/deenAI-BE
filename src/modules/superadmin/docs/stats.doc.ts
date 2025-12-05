import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

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

  static getUserGrowth() {
    return applyDecorators(
      ApiOperation({
        summary: 'Get user growth metrics',
        description:
          'Retrieves user growth statistics including users registered per day/week/month, growth rate, and cumulative count. Supports period, startDate, and endDate query parameters. Requires superadmin privileges.',
      }),
      ApiQuery({
        name: 'period',
        required: false,
        enum: ['day', 'week', 'month'],
        description: 'Time period granularity for grouping user registrations',
        example: 'day',
      }),
      ApiQuery({
        name: 'startDate',
        required: false,
        description: 'Start date for the growth metrics (ISO 8601 format). Defaults to 30 days ago if not provided.',
        example: '2025-01-01T00:00:00.000Z',
      }),
      ApiQuery({
        name: 'endDate',
        required: false,
        description: 'End date for the growth metrics (ISO 8601 format). Defaults to current date if not provided.',
        example: '2025-01-31T23:59:59.999Z',
      }),
      ApiResponse({
        status: 200,
        description: 'User growth statistics retrieved successfully',
        schema: {
          example: {
            success: true,
            status: 'success',
            message: 'User growth statistics retrieved successfully',
            data: {
              period: 'day',
              points: [
                {
                  timestamp: '2025-01-15T00:00:00.000Z',
                  count: 25,
                  cumulative: 150,
                  growthRate: 12.5,
                },
                {
                  timestamp: '2025-01-16T00:00:00.000Z',
                  count: 30,
                  cumulative: 180,
                  growthRate: 20.0,
                },
              ],
            },
            status_code: 200,
          },
        },
      }),
      ApiResponse({
        status: 400,
        description: 'Bad request - Invalid date range',
        schema: {
          example: {
            success: false,
            status: 'error',
            message: 'Invalid date range',
            status_code: 400,
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
            message: 'Failed to compute user growth',
            status_code: 500,
          },
        },
      }),
    );
  }

  static getUserEngagement() {
    return applyDecorators(
      ApiOperation({
        summary: 'Get user engagement metrics',
        description:
          'Retrieves user engagement statistics including users with streaks, average streak lengths, and users with reflections, bookmarks, and chats. Requires superadmin privileges.',
      }),
      ApiResponse({
        status: 200,
        description: 'User engagement statistics retrieved successfully',
        schema: {
          example: {
            success: true,
            status: 'success',
            message: 'User engagement statistics retrieved successfully',
            data: {
              usersWithStreaks: 45,
              averageStreakLength: 12.5,
              averageHighestStreak: 18.3,
              usersWithReflections: 120,
              usersWithBookmarks: 85,
              usersWithChats: 95,
              totalReflections: 450,
              totalBookmarks: 320,
              totalChats: 180,
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
            message: 'Failed to compute user engagement',
            status_code: 500,
          },
        },
      }),
    );
  }
}
