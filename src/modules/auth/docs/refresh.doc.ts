import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';

export class RefreshDocs {
  static refresh() {
    return applyDecorators(
      ApiOperation({ summary: 'Refresh Access Token' }),
      ApiBody({ type: RefreshTokenDto }),
      ApiResponse({
        status: 200,
        description: 'Tokens refreshed successfully',
        schema: {
          example: {
            success: true,
            status: 'success',
            message: 'Tokens refreshed successfully',
            data: {
              tokens: {
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              },
            },
            status_code: 200,
          },
        },
      }),
    );
  }
}

