import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Email of the user resetting the password',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'OTP received for password reset',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;

  @ApiProperty({
    description: 'New password to set',
    example: 'SuperSecurePassword123!',
    minLength: 6,
    maxLength: 128,
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 128)
  newPassword: string;
}
