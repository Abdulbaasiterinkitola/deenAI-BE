import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { LoginBodyValidator } from '../validators/login.validator';
import {
  DocsResponseDto,
  UnauthorizedResponseDto,
  ValidationResponseDto,
  BadResponseDto,
} from '@shared/docs-response.dto';
import { UserResponseDto } from '../../users/dtos/user-response.dto';

export class LoginDocs {
  static login() {
    return applyDecorators(
      ApiOperation({
        summary: 'User login with email and password',
        description:
          'Authenticates a user with LOCAL auth provider using email and password, returning a JWT token and user information.',
      }),
      ApiBody({ type: LoginBodyValidator }),
      ApiResponse({
        status: 200,
        description: 'Successful login',
        type: DocsResponseDto(UserResponseDto, {
          token: 'string',
        }),
      }),
      ApiUnauthorizedResponse({
        description: 'Invalid credentials or non-LOCAL provider',
        type: UnauthorizedResponseDto,
      }),
      ApiBadRequestResponse({
        description: 'Validation failed',
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
<<<<<<< HEAD
=======

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
>>>>>>> 7b5622d97bcab8e39188d86b8dfa5e08e04dbdf4
