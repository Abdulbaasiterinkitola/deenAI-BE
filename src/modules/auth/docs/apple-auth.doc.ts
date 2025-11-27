import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import {
  AppleAuthRequestDto,
  AppleAuthResponseDto,
} from '../dtos/apple-auth.dto';

export class AppleAuthDocs {
  static appleAuth() {
    return applyDecorators(
      ApiOperation({
        summary: 'Apple Sign-In',
        description: 'Authenticate a user using Apple ID token',
      }),
      ApiBody({ type: AppleAuthRequestDto }),
      ApiResponse({
        status: 200,
        description: 'Apple authentication successful',
        type: AppleAuthResponseDto,
      }),
      ApiResponse({
        status: 400,
        description: 'Bad Request - Invalid token or configuration',
      }),
      ApiResponse({
        status: 401,
        description: 'Unauthorized - Token verification failed',
      }),
      ApiResponse({
        status: 409,
        description: 'Conflict - Provider mismatch or account already exists',
      }),
    );
  }
}
