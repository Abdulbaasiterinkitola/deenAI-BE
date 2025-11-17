import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOperation,
  ApiProperty,
  ApiResponse,
} from '@nestjs/swagger';
import { BadResponseDto } from '@shared/docs-response.dto';
import { ForgotPasswordBodyValidator } from '../validators/forgotPassword.validator';

export class ForgotPasswordDocs {
  static forgotPassword() {
    return applyDecorators(
      ApiOperation({ summary: 'Forgot Password' }),
      ApiBody({ type: ForgotPasswordBodyValidator }),
      ApiResponse({
        status: 200,
        description: 'Password reset email sent successfully',
        type: ForgotPasswordResponseDto,
      }),
      ApiBadRequestResponse({
        description: 'Invalid email or user not found',
        type: BadResponseDto,
      }),
    );
  }
}

export class ForgotPasswordResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indicates if the operation was successful',
  })
  success: boolean;

  @ApiProperty({
    example: 'Password reset email sent successfully.',
    description: 'Response message',
  })
  message: string;
}
