import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { LoginBodyValidator } from '../validators/login.validator';
import {
  UnauthorizedResponseDto,
  ValidationResponseDto,
  BadResponseDto,
} from '@shared/docs-response.dto';

export class LoginDocs {
  static login() {
    return applyDecorators(
      ApiOperation({ summary: 'Login user' }),
      ApiBody({ type: LoginBodyValidator }),
      ApiResponse({
        status: 200,
        description: 'Login successful',
        schema: {
          example: {
            success: true,
            status: 'success',
            message: 'Login successful',
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
                updatedAt: '2025-11-20T19:04:58.434Z',
              },
              tokenUsage: {
                plan: {
                  id: '123e4567-e89b-12d3-a456-426614174000',
                  name: 'Premium Plan',
                  slug: 'premium',
                  tokenLimit: 100000,
                },
                tokensUsed: 50000,
                tokensLimit: 100000,
                tokensRemaining: 50000,
                tokensUsedPercentage: 50,
                billingCycleStart: '2025-01-15T10:00:00.000Z',
                isLimitReached: false,
                isApproachingLimit: false,
              },
            },
            status_code: 200,
          },
        },
      }),
      ApiUnauthorizedResponse({
        description: 'Invalid credentials or non-LOCAL provider',
        type: UnauthorizedResponseDto,
      }),
      ApiBadRequestResponse({
        description: 'Validation failed',
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
