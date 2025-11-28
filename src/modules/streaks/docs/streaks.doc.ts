import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

export class StreaksDocs {
  static getStreakState() {
    return applyDecorators(
      ApiOperation({
        summary: 'Get user streak state',
        description:
          'Retrieves the current streak state for the authenticated user, including whether the streak can be updated today based on the user\'s timezone. Returns streak information, update eligibility, and next available update time if already updated today.',
      }),
      ApiBearerAuth(),
      ApiResponse({
        status: 200,
        description: 'Streak state retrieved successfully',
        schema: {
          example: {
            success: true,
            status: 'success',
            message: 'Operation successful',
            data: {
              id: '9f83b7c8-1b23-4d56-9471-8a0c2d55b123',
              userId: 'd1b5e1c2-34a5-4f9e-a8d7-9c2b1a3f4e56',
              type: 'hadith',
              currentStreak: 5,
              highestStreak: 10,
              lastCompletedAt: '2025-01-15T17:00:00.000Z',
              lastCompletedAtWithTimeZone: '2025-01-15T12:00:00.000-05:00',
              canUpdateToday: false,
              nextUpdateAvailableAt: '2025-01-16T00:00:00.000Z',
              timezone: 'America/New_York',
              createdAt: '2025-01-01T12:00:00.000Z',
              updatedAt: '2025-01-15T12:00:00.000Z',
            },
            status_code: 200,
          },
        },
      }),
      ApiResponse({
        status: 401,
        description: 'Unauthorized - Bearer token is required',
        schema: {
          example: {
            success: false,
            status: 'error',
            message: 'Authorization Header Missing',
            status_code: 401,
          },
        },
      }),
      ApiResponse({
        status: 404,
        description: 'Streak record not found',
        schema: {
          example: {
            success: false,
            status: 'error',
            message: 'Streak record not found',
            status_code: 404,
          },
        },
      }),
      ApiResponse({
        status: 500,
        description: 'Internal server error',
      }),
    );
  }

  static updateStreak() {
    return applyDecorators(
      ApiOperation({
        summary: 'Update user streak',
        description:
          'Updates the streak for the authenticated user. The backend uses the current server time and converts it to the user’s timezone (defaults to UTC) to determine whether the streak can be incremented. The streak can only be updated once per day in the user’s timezone. No request body is required.',
      }),
      ApiBearerAuth(),
      ApiResponse({
        status: 200,
        description: 'Streak updated successfully',
        schema: {
          example: {
            success: true,
            status: 'success',
            message: 'Streak updated successfully',
            data: {
              id: '9f83b7c8-1b23-4d56-9471-8a0c2d55b123',
              userId: 'd1b5e1c2-34a5-4f9e-a8d7-9c2b1a3f4e56',
              type: 'hadith',
              currentStreak: 5,
              highestStreak: 10,
              lastCompletedAt: '2025-01-15T12:00:00.000Z',
              createdAt: '2025-01-01T12:00:00.000Z',
              updatedAt: '2025-01-15T12:00:00.000Z',
            },
            status_code: 200,
          },
        },
      }),
      ApiResponse({
        status: 401,
        description: 'Unauthorized - Bearer token is required',
        schema: {
          example: {
            success: false,
            status: 'error',
            message: 'Authorization Header Missing',
            status_code: 401,
          },
        },
      }),
      ApiResponse({
        status: 404,
        description: 'Streak record not found',
      }),
      ApiResponse({
        status: 429,
        description:
          'Too many requests - Streak can only be updated once per day in the user\'s timezone',
        schema: {
          example: {
            success: false,
            status: 'error',
            message:
              'Streak can only be updated once per day. Please try again in 12 hour(s).',
            status_code: 429,
          },
        },
      }),
      ApiResponse({
        status: 500,
        description: 'Internal server error',
      }),
    );
  }
}
