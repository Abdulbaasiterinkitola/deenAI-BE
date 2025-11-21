import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { BadResponseDto } from '@shared/docs-response.dto';
import { RequestOtpDto } from '../dtos/forgot-password.dto';

export class ForgotPasswordDocs {
  static forgotPassword() {
    return applyDecorators(
      ApiOperation({ summary: 'Forgot password' }),
      ApiBody({ type: RequestOtpDto }),
      ApiResponse({
        status: 200,
        description: 'Request password reset OTP',
        schema: {
          example: {
            success: true,
            status: 'success',
            message: 'Password reset OTP sent successfully',
            status_code: 200,
          },
        },
      }),
      ApiBadRequestResponse({
        description: 'Invalid email or user not found',
        type: BadResponseDto,
      }),
    );
  }
}
