import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SqueezeBodyValidator } from '../validators/squeeze.validator';
import {
  ValidationResponseDto,
  BadResponseDto,
} from '@shared/docs-response.dto';

class SqueezeRegistrationDoc {
  @ApiProperty({ example: 'a7e92c4e-3f21-4a5d-a8ae-57b923f1eac7' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'Umar', required: false })
  name?: string;

  @ApiProperty({ example: '2025-01-01T12:00:00.000Z' })
  created_at: Date;

  @ApiProperty({ example: '2025-01-01T12:00:00.000Z' })
  updated_at: Date;
}

class SqueezeRegistrationResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'Blog registration successful' })
  message: string;

  @ApiProperty({ type: SqueezeRegistrationDoc })
  data: SqueezeRegistrationDoc;

  @ApiProperty({ example: 201 })
  status_code: number;
}

export const SqueezeDocs = {
  tag: ApiTags('Squeeze'),
  register: () =>
    applyDecorators(
      ApiOperation({ summary: 'Register for blog' }),
      ApiBody({ type: SqueezeBodyValidator }),
      ApiResponse({
        status: 201,
        description: 'Successfully registered',
        type: SqueezeRegistrationResponseDto,
      }),
      ApiResponse({
        status: 409,
        description: 'Email already registered',
        type: BadResponseDto,
      }),
      ApiResponse({
        status: 422,
        description: 'Validation error',
        type: ValidationResponseDto,
      }),
    ),
};
