import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export class GetProfileDocs {
  static getProfile() {
    return applyDecorators(
      ApiOperation({
        summary: 'Get user profile',
        description:
          "Fetch the authenticated user's profile including user information.",
      }),
      ApiBearerAuth(),
      ApiResponse({
        status: 200,
        description: 'Profile retrieved successfully',
        schema: {
          examples: {
            completeProfile: {
              summary: 'Profile with all fields',
              value: {
                success: true,
                message: 'Profile retrieved successfully',
                data: {
                  id: '123e4567-e89b-12d3-a456-426614174000',
                  userId: '123e4567-e89b-12d3-a456-426614174001',
                  avatar: 'https://example.com/avatar.jpg',
                  language: 'en',
                  username: 'john_doe',
                  user: {
                    name: 'John Doe',
                    email: 'john@example.com',
                  },
                  createdAt: '2025-01-15T10:00:00.000Z',
                  updatedAt: '2025-01-15T10:00:00.000Z',
                },
              },
            },
            minimalProfile: {
              summary: 'Profile with minimal data',
              value: {
                success: true,
                message: 'Profile retrieved successfully',
                data: {
                  id: '123e4567-e89b-12d3-a456-426614174000',
                  userId: '123e4567-e89b-12d3-a456-426614174001',
                  avatar: null,
                  language: null,
                  username: null,
                  user: {
                    name: 'Jane Smith',
                    email: 'jane@example.com',
                  },
                  createdAt: '2025-01-15T10:00:00.000Z',
                  updatedAt: '2025-01-15T10:00:00.000Z',
                },
              },
            },
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
        description: 'Profile not found',
        schema: {
          example: {
            success: false,
            message: 'Profile not found',
            status_code: 404,
          },
        },
      }),
    );
  }
}
