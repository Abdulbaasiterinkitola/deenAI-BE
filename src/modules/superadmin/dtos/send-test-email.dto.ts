import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class SendTestEmailDto {
  @ApiProperty({
    description: 'Email address to send the test email to.',
    example: 'test@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Subject of the email.' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiPropertyOptional({
    description: 'The name of the email template to test.',
  })
  @IsOptional()
  @IsString()
  template?: string;

  @ApiPropertyOptional({
    description: 'Context variables for email templates.',
  })
  @IsOptional()
  @IsObject()
  context?: Record<string, any>;
}
