import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestOtpDto {
  @ApiProperty({
    description: 'Email of the user requesting an OTP',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
