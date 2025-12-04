import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserStatus } from '../../users/enums/user-status.enum';

class UserFilterDto {
  @ApiPropertyOptional({
    enum: UserStatus,
    description: 'Filter by user status.',
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({
    description: 'Filter by registration date (e.g., "2023-01-01").',
  })
  @IsOptional()
  @IsDateString()
  registrationDate?: string;

  @IsOptional()
  @IsString()
  plan?: string;

  @IsOptional()
  registrationDateFrom?: Date;

  @IsOptional()
  registrationDateTo?: Date;

  @IsOptional()
  lastActivityFrom?: Date;
}

export class SendBulkEmailDto {
  @ApiPropertyOptional({
    description: 'Array of user IDs to send email to.',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  userIds?: string[];

  @ApiPropertyOptional({
    description: 'Filters to select users for the bulk email.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserFilterDto)
  filters?: UserFilterDto;

  @ApiProperty({ description: 'Subject of the email.' })
  @IsString()
  subject: string;

  @ApiProperty({ description: 'Message content of the email.' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Email template to use.' })
  @IsOptional()
  @IsString()
  template?: string;

  @ApiPropertyOptional({ description: 'Context for the email template.' })
  @IsOptional()
  context?: Record<string, any>;
}
