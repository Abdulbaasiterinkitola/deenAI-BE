import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginBodyValidator } from '../validators/login.validator';
import {
  BadResponseDto,
  UnauthorizedResponseDto,
  ValidationResponseDto,
} from '@shared/docs-response.dto';
import { User } from '@modules/users/models/user.model';

export class LoginDocs {
  static login() {
    return applyDecorators(
      ApiOperation({ summary: 'User Login (password/email)' }),
      ApiBody({ type: LoginBodyValidator }),
      ApiResponse({
        status: 200,
        description: 'User logged in successfully.',
        type: LoginResponseDto,
      }),
      ApiUnauthorizedResponse({
        description: 'Invalid credentials or non-local auth provider',
        type: UnauthorizedResponseDto,
      }),
      ApiBadRequestResponse({
        description: 'Invalid request parameters',
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

export class LoginResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indicates if the operation was successful',
  })
  success: boolean;

  @ApiProperty({
    example: 'User logged in successfully.',
    description: 'Response message',
  })
  message: string;

  @ApiProperty({
    type: () => LoginData,
  })
  data: LoginData;
}

class LoginData {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT token for the user',
  })
  token: string;

  @ApiProperty({
    type: () => User,
  })
  user: User;
}
