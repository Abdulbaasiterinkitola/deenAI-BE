import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { applyDecorators } from '@nestjs/common';

export class ResetPasswordDocs {
  static resetPassword() {
    return applyDecorators(
      ApiOperation({ summary: 'Reset user password using token' }),
      ApiBody({ type: ResetPasswordDto }),
      ApiResponse({ status: 200, description: 'Password successfully reset' }),
    );
  }
}
