import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';

export class GoogleAuthRequestDto {
  @ApiProperty({
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...',
    description: 'Google ID token received from Google OAuth2',
  })
  @IsNotEmpty({ message: 'ID token is required' })
  @IsString({ message: 'ID token must be a string' })
  idToken: string;

  @ApiProperty({
    example: 'web',
    description:
      'Platform from which the request is made. Optional but recommended for better client ID validation. If not provided, token will be validated against all configured client IDs.',
    enum: ['web', 'android', 'ios'],
    required: false,
    examples: {
      web: {
        value: 'web',
        description: 'Web application using Google OAuth2 web flow',
      },
      android: {
        value: 'android',
        description: 'Android app using Google Sign-In SDK',
      },
      ios: {
        value: 'ios',
        description: 'iOS app using Google Sign-In SDK',
      },
    },
  })
  @IsOptional()
  @IsString({ message: 'Platform must be a string' })
  @IsIn(['web', 'android', 'ios'], {
    message: 'Platform must be web, android, or ios',
  })
  platform?: string;
}

export class GoogleAuthResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Google authentication successful' })
  message: string;

  @ApiProperty({
    type: 'object',
    properties: {
      token: {
        type: 'string',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'JWT access token',
      },
      user: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid' },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', example: 'user@gmail.com' },
          authProvider: { type: 'string', example: 'google' },
          isEmailVerified: { type: 'boolean', example: true },
          createdAt: { type: 'string', example: '2023-01-01T00:00:00.000Z' },
          updatedAt: { type: 'string', example: '2023-01-01T00:00:00.000Z' },
        },
      },
    },
  })
  data: {
    token: string;
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
