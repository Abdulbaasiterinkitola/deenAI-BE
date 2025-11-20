import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateProfileDto } from '../dto/create-profile.dto';

export class CreateProfileDocs {
  static createProfile() {
    return applyDecorators(
      ApiOperation({
        summary: 'Create user profile',
        description:
          'Allows authenticated users to create their profile. All fields are optional and can be set later.',
      }),
      ApiBearerAuth(),
      ApiBody({
        type: CreateProfileDto,
        description: 'Profile creation payload. All fields are optional.',
        examples: {
          minimal: {
            summary: 'Create an empty profile',
            value: {},
          },
          full: {
            summary: 'Create profile with all fields',
            value: {
              username: 'john_doe',
              language: 'en',
              avatar: 'https://example.com/avatar.jpg',
            },
          },
        },
      }),
      ApiResponse({
        status: 201,
        description: 'Profile created successfully',
        schema: {
          example: {
            success: true,
            message: 'Profile created successfully',
            data: {
              id: '123e4567-e89b-12d3-a456-426614174000',
              userId: '123e4567-e89b-12d3-a456-426614174001',
              avatar: 'https://example.com/avatar.jpg',
              language: 'en',
              username: 'john_doe',
              createdAt: '2025-01-15T10:00:00.000Z',
              updatedAt: '2025-01-15T10:00:00.000Z',
            },
          },
        },
      }),
      ApiResponse({
        status: 400,
        description: 'Bad request - Profile already exists or username taken',
        schema: {
          example: {
            success: false,
            message: 'Profile already exists',
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
              language: ['Language code must not exceed 10 characters'],
            },
            status_code: 422,
          },
        },
      }),
    );
  }
}
