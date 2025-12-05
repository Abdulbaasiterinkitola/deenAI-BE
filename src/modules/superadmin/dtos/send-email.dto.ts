import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class SendEmailDto {
  @ApiPropertyOptional({ description: 'ID of the user to send email to.' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Email address to send to (if userId is not provided).',
  })
  @ValidateIf((o) => !o.userId)
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Subject of the email.' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ description: 'The message body of the email (HTML or text).' })
  @IsString()
  @IsNotEmpty()
  message?: string;

  @ApiPropertyOptional({
    description: 'Email template to use.',
  })
  @IsOptional()
  @IsString()
  template?: string;

  @ApiPropertyOptional({
    description: 'Context for email templates.',
  })
  @IsOptional()
  @IsObject()
  context?: Record<string, any>;
}
