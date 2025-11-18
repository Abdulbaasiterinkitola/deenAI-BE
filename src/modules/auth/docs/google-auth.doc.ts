import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GoogleAuthValidator } from '../validators/google-auth.validator';
import {
  BadResponseDto,
  UnauthorizedResponseDto,
  ValidationResponseDto,
} from '@shared/docs-response.dto';
import { User } from '@modules/users/models/user.model';

export class GoogleAuthDocs {
  static googleAuth() {
    return applyDecorators(
      ApiOperation({ summary: 'User Authentication with Google OAuth2' }),
      ApiBody({ type: GoogleAuthValidator }),
      ApiResponse({
        status: 200,
        description: 'User authenticated successfully with Google.',
        type: GoogleAuthResponseDto,
      }),
      ApiUnauthorizedResponse({
        description: 'Invalid Google ID token or authentication failed',
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

class GoogleAuthData {
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

export class GoogleAuthResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indicates if the operation was successful',
  })
  success: boolean;

  @ApiProperty({
    example: 'Google authentication successful',
    description: 'Response message',
  })
  message: string;

  @ApiProperty({
    type: () => GoogleAuthData,
  })
  data: GoogleAuthData;
}