import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VerifyOtpDto } from '../dtos/verify-otp.dto';

export class VerifyOtpDocs {
  static verifyOtp() {
    return applyDecorators(
      ApiOperation({
        summary: 'Verify OTP for password reset purposes',
      }),
      ApiBody({ type: VerifyOtpDto }),
      ApiResponse({
        status: 200,
        description: 'OTP verified successfully',
        schema: {
          example: {
            success: true,
            status: 'success',
            message: 'OTP verified successfully',
            status_code: 200,
          },
        },
      }),
    );
  }
}
