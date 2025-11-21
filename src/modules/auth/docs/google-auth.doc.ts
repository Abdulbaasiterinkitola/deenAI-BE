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
      ApiOperation({ summary: 'Google OAuth login' }),
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
              },
            },
            status_code: 200,
          },
        },
      }),
      ApiUnauthorizedResponse({
        description: 'Invalid Google ID token or authentication failed',
        type: UnauthorizedResponseDto,
      }),
      ApiBadRequestResponse({
        description: 'Invalid request parameters',
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
