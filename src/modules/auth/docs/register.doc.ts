import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { RegisterBodyValidator } from '../validators/register.validator';
import {
  BadResponseDto,
  ValidationResponseDto,
} from '@shared/docs-response.dto';

export class RegisterDocs {
  static register() {
    return applyDecorators(
      ApiOperation({ summary: 'Register new user account' }),
      ApiBody({ type: RegisterBodyValidator }),
      ApiResponse({
        status: 201,
        description: 'User registered successfully',
        schema: {
          example: {
            success: true,
            status: 'success',
            message:
              'User registered successfully.',
            data: {
              tokens: {
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              },
              user: {
                id: '7f44fb53-450c-4b7b-bcb7-7fe33c56ad68',
                name: 'John Doe',
                email: 'user@example.com',
                authProvider: 'local',
                isEmailVerified: true,
                createdAt: '2025-11-20T19:02:39.633Z',
                updatedAt: '2025-11-20T19:02:39.633Z',
              },
              profile: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                userId: '7f44fb53-450c-4b7b-bcb7-7fe33c56ad68',
                name: 'John Doe',
                email: 'user@example.com',
                username: 'john_doe',
                language: 'en',
                avatar: null,
                timezone: 'UTC',
                createdAt: '2025-11-20T19:02:39.633Z',
                updatedAt: '2025-11-20T19:02:39.633Z',
              }
            },
            status_code: 201,
          },
        },
      }),
      ApiBadRequestResponse({
        description: 'User already exists or invalid request parameters',
        type: BadResponseDto,
      }),
      ApiResponse({
        status: 422,
        description: 'Validation error',
        type: ValidationResponseDto,
      }),
    );
  }
}