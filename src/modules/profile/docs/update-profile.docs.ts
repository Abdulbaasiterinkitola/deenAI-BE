import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UpdateProfileDto } from '../dto/update-profile.dto';

export class UpdateProfileDocs {
  static updateProfile() {
    return applyDecorators(
      ApiOperation({
        summary: 'Update user profile',
        description:
          'Allows authenticated users to update their profile information including avatar, language, username, and timezone. All fields are optional (partial update).',
      }),
      ApiBearerAuth(),
      ApiBody({
        type: UpdateProfileDto,
        description: 'Profile update data. All fields are optional.',
        examples: {
          updateAll: {
            summary: 'Update all fields',
            description: 'Update username, language, and avatar at once',
            value: {
              username: 'john_doe',
              language: 'en',
              avatar: 'https://example.com/avatar.jpg',
            },
          },
          updateUsername: {
            summary: 'Update only username',
            description: 'Partial update - only change username',
            value: {
              username: 'new_username',
            },
          },
          updateLanguage: {
            summary: 'Update only language',
            description: 'Change user language preference',
            value: {
              language: 'ar',
            },
          },
          updateTimezone: {
            summary: 'Update timezone',
            description: 'Set user timezone for accurate prayer times and streaks',
            value: {
              timezone: 'America/New_York',
            },
          },
          clearAvatar: {
            summary: 'Remove avatar',
            description: 'Set avatar to null to remove it',
            value: {
              avatar: null,
            },
          },
        },
      }),
      ApiResponse({
        status: 200,
        description: 'Profile updated successfully',
        schema: {
          example: {
            success: true,
            message: 'Profile updated successfully',
            data: {
              id: '123e4567-e89b-12d3-a456-426614174000',
              userId: '123e4567-e89b-12d3-a456-426614174001',
              avatar: 'https://example.com/avatar.jpg',
              language: 'en',
              username: 'john_doe',
              createdAt: '2025-01-15T10:00:00.000Z',
              updatedAt: '2025-01-15T10:30:00.000Z',
            },
          },
        },
      }),
      ApiResponse({
        status: 400,
        description: 'Bad request - Username already exists',
        schema: {
          example: {
            success: false,
            message: 'Username already exists',
            status_code: 400,
          },
        },
      }),
      ApiResponse({
        status: 401,
        description: 'Unauthorized - Missing or invalid authentication token',
        schema: {
          example: {
            success: false,
            message: 'Authorization Header Missing',
            status_code: 401,
          },
        },
      }),
      ApiResponse({
        status: 404,
        description: 'Not found - Profile does not exist for this user',
        schema: {
          example: {
            success: false,
            message: 'Profile not found',
            status_code: 404,
          },
        },
      }),
      ApiResponse({
        status: 422,
        description: 'Validation failed - Invalid input data',
        schema: {
          example: {
            success: false,
            message: 'Validation failed',
            errors: {
              username: [
                'Username must be at least 3 characters long',
                'Username can only contain letters, numbers, and underscores',
              ],
              language: ['Language code must be at least 2 characters'],
            },
            status_code: 422,
          },
        },
      }),
    );
  }
}
