import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
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
    description: 'Filter by plan slug.',
  })
  @IsOptional()
  @IsString()
  plan?: string;

  @ApiPropertyOptional({
    description: 'Filter by registration date from.',
  })
  @IsOptional()
  registrationDateFrom?: Date;

  @ApiPropertyOptional({
    description: 'Filter by registration date to.',
  })
  @IsOptional()
  registrationDateTo?: Date;

  @ApiPropertyOptional({
    description: 'Filter by last activity from.',
  })
  @IsOptional()
  lastActivityFrom?: Date;
}

export class SendBulkPushDto {
  @ApiPropertyOptional({
    description: 'Array of user IDs to send push notification to.',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  userIds?: string[];

  @ApiPropertyOptional({
    description: 'Filters to select users for the bulk push notification.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserFilterDto)
  filters?: UserFilterDto;

  @ApiProperty({ description: 'Title of the push notification.' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Body content of the push notification.' })
  @IsString()
  body: string;

  @ApiPropertyOptional({
    description: 'Additional data payload for the push notification.',
  })
  @IsOptional()
  data?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Image URL for the push notification.',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
