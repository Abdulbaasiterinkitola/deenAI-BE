import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOperation,
  ApiProperty,
  ApiResponse,
} from '@nestjs/swagger';
import { RegisterBodyValidator } from '../validators/register.validator';
import {
  BadResponseDto,
  ValidationResponseDto,
} from '@shared/docs-response.dto';

export class RegisterDocs {
  static register() {
    return applyDecorators(
      ApiOperation({ summary: 'User Register (password/email)' }),
      ApiBody({ type: RegisterBodyValidator }),
      ApiResponse({
        status: 201,
        description:
          'User created successfully. Please check your email for email verification',
        type: RegisterResponseDto,
        example: {
          success: true,
          message: 'User created successfully.',
        },
      }),
      ApiBadRequestResponse({
        description: 'User already exists or invalid request parameters',
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

export class RegisterResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indicates if the operation was successful',
  })
  success: boolean;

  @ApiProperty({
    example: 'User created successfully.',
    description: 'Response message',
  })
  message: string;
}
