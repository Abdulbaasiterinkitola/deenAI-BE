import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsNotEmpty, IsString } from 'class-validator';

export class SqueezeBodyValidator {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address for blog subscription',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Umar',
    description: 'Optional name of the subscriber',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
}
