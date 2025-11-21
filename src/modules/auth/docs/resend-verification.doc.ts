import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { RequestOtpDto } from '../dtos/forgot-password.dto';
import { BadResponseDto } from '@shared/docs-response.dto';

export class ResendVerificationDocs {
  static resendVerification() {
    return applyDecorators(
      ApiOperation({
        summary: 'Resend email verification OTP',
        description:
          'Resends verification OTP to user email if account exists and is not yet verified',
      }),
      ApiBody({ type: RequestOtpDto }),
      ApiResponse({
        status: 200,
        description: 'Verification OTP resent successfully',
        schema: {
          example: {
            success: true,
            status: 'success',
            message: 'Verification OTP resent successfully',
            status_code: 200,
          },
        },
      }),
      ApiBadRequestResponse({
        description: 'Email already verified or user not found',
        schema: {
          example: {
            success: false,
            message: 'Email is already verified',
            status_code: 400,
          },
        },
        type: BadResponseDto,
      }),
    );
  }
}
