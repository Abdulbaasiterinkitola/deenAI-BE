import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

export class LogoutDocs {
  static logout() {
    return applyDecorators(
      ApiBearerAuth(),
      ApiOperation({ summary: 'Logout user' }),
      ApiResponse({
        status: 200,
        description: 'Successfully logged out',
        schema: {
          example: {
            success: true,
            status: 'success',
            message: 'Successfully logged out',
            status_code: 200,
          },
        },
      }),
    );
  }
}

