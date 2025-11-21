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
  DocsResponseDto,
  UnauthorizedResponseDto,
  ValidationResponseDto,
  BadResponseDto,
} from '@shared/docs-response.dto';
import { UserResponseDto } from '../../users/dtos/user-response.dto';

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
        type: DocsResponseDto<UserResponseDto>(UserResponseDto, {
          token: 'string',
        }),
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
