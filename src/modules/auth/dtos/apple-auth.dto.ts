import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AppleAuthRequestDto {
  @ApiProperty({
    example: 'eyJraWQiOiJBSURrZXkiLCJhbGciOiJSUzI1NiJ9....',
    description: 'Apple ID token received from Apple Sign-In',
  })
  @IsNotEmpty({ message: 'ID token is required' })
  @IsString({ message: 'ID token must be a string' })
  idToken: string;
}

export class AppleAuthResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Apple authentication successful' })
  message: string;

  @ApiProperty({
    type: 'object',
    properties: {
      tokens: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
        },
      },
      user: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid' },
          name: { type: 'string', example: 'Jane Doe' },
          email: { type: 'string', example: 'user@apple.com' },
          authProvider: { type: 'string', example: 'apple' },
          isEmailVerified: { type: 'boolean', example: true },
          createdAt: { type: 'string', example: '2023-01-01T00:00:00.000Z' },
          updatedAt: { type: 'string', example: '2023-01-01T00:00:00.000Z' },
        },
      },
    },
  })
  data: {
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
    user: {
      id: string;
      name: string;
      email: string;
      authProvider: string;
      isEmailVerified: boolean;
      createdAt: string;
      updatedAt: string;
    };
  };
}
