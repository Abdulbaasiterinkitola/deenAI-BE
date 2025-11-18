import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Email of the user to verify OTP for',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty() 
  email: string;

  @ApiProperty({
    description: 'OTP to verify',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;
}
