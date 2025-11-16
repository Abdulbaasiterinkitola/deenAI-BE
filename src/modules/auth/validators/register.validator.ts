import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class RegisterBodyValidator {
  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
  })
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd',
    description:
      'User password (min 8 chars, must include uppercase, lowercase, number, and special character)',
  })
  @IsString()
  @MinLength(8)
  @IsStrongPassword()
  password: string;
}
