import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginBodyValidator } from '../validators/login.validator';
import { DocsResponseDto } from '../../../shared/docs-response.dto';
import { UserModelAction } from '../../users/action-models/user.action-model';

export class LoginDocs {
  static login() {
    return applyDecorators(
      ApiOperation({
        summary: 'User login with email and password',
        description:
          'Authenticates a user with LOCAL auth provider using email and password, returning a JWT token and user information.',
      }),
      ApiBody({ type: LoginBodyValidator }),
      ApiResponse({
        status: 200,
        description: 'Successful login',
        type: DocsResponseDto(UserModelAction, {
          token: 'string',
        }),
      }),
      ApiResponse({
        status: 401,
        description: 'Unauthorized - Invalid credentials or non-LOCAL provider',
        schema: {
          example: {
            success: false,
            message: 'Invalid login credentials',
            status_code: 401,
          },
        },
      }),
      ApiResponse({
        status: 422,
        description: 'Validation failed',
        schema: {
          example: {
            success: false,
            message: 'Validation failed',
            errors: {
              email: ['email must be an email'],
              password: ['password should not be empty'],
            },
            status_code: 422,
          },
        },
      }),
    );
  }
}
