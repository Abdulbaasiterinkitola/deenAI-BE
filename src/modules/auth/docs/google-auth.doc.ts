import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GoogleAuthValidator } from '../validators/google-auth.validator';
import {
  BadResponseDto,
  UnauthorizedResponseDto,
  ValidationResponseDto,
} from '@shared/docs-response.dto';

export class GoogleAuthDocs {
  static googleAuth() {
    return applyDecorators(
      ApiOperation({
        summary: 'Google OAuth login (Multi-platform support)',
        description:
          'Authenticate users with Google OAuth2. Supports web, Android, and iOS platforms. The platform parameter is optional but recommended for better client ID validation.',
      }),
      ApiBody({ type: GoogleAuthValidator }),
      ApiResponse({
        status: 200,
        description: 'Google login successful',
        schema: {
          example: {
            success: true,
            status: 'success',
            message: 'Google login successful',
            data: {
              tokens: {
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              },
              user: {
                id: '7f44fb53-450c-4b7b-bcb7-7fe33c56ad68',
                name: 'John Doe',
                email: 'user@example.com',
                authProvider: 'google',
                isEmailVerified: true,
                createdAt: '2023-01-01T00:00:00.000Z',
                updatedAt: '2023-01-01T00:00:00.000Z',
              },
            },
            status_code: 200,
          },
        },
      }),
      ApiUnauthorizedResponse({
        description: 'Invalid Google ID token or authentication failed',
        type: UnauthorizedResponseDto,
        schema: {
          examples: {
            invalidToken: {
              value: {
                success: false,
                status: 'error',
                message: 'Invalid Google token',
                status_code: 401,
              },
            },
            clientIdMismatch: {
              value: {
                success: false,
                status: 'error',
                message:
                  'Invalid Google token: client ID mismatch for android platform',
                status_code: 401,
              },
            },
          },
        },
      }),
      ApiBadRequestResponse({
        description: 'Invalid request parameters',
        type: BadResponseDto,
      }),
      ApiResponse({
        status: 409,
        description: 'Account exists with different authentication provider',
        schema: {
          example: {
            success: false,
            status: 'error',
            message:
              'This account uses local authentication. Please sign in with your local account.',
            status_code: 409,
          },
        },
      }),
      ApiResponse({
        status: 422,
        description: 'Validation error',
        type: ValidationResponseDto,
      }),
      ApiResponse({
        status: 500,
        description: 'OAuth client IDs not configured',
        schema: {
          example: {
            success: false,
            status: 'error',
            message: 'No OAuth client IDs configured',
            status_code: 500,
          },
        },
      }),
    );
  }
}
