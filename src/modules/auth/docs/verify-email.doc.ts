import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { VerifyOtpDto } from '../dtos/verify-otp.dto';
import { BadResponseDto } from '@shared/docs-response.dto';

export class VerifyEmailDocs {
  static verifyEmail() {
    return applyDecorators(
      ApiOperation({
        summary: 'Verify email address using OTP sent during registration',
        description:
          'Verifies the user email address with OTP and sends welcome email upon successful verification',
      }),
      ApiBody({ type: VerifyOtpDto }),
      ApiResponse({
        status: 200,
        description: 'Email verified successfully',
        schema: {
          example: {
            success: true,
            status: 'success',
            message: 'Email verified successfully',
            status_code: 200,
          },
        },
      }),
      ApiBadRequestResponse({
        description: 'Invalid or expired OTP / Email already verified',
        schema: {
          example: {
            success: false,
            message: 'Invalid or expired OTP',
            status_code: 400,
          },
        },
        type: BadResponseDto,
      }),
    );
  }
}

