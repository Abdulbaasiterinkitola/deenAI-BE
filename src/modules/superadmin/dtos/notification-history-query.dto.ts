import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import {
  NotificationStatus,
  NotificationType,
} from '../../notification-settings/entities/notification-log.entity';

export class NotificationHistoryQueryDto {
  @ApiPropertyOptional({ description: 'Page number.', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page? = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page.',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit? = 10;

  @ApiPropertyOptional({
    enum: NotificationType,
    description: 'Filter by notification type.',
  })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({
    enum: NotificationStatus,
    description: 'Filter by notification status.',
  })
  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @ApiPropertyOptional({ description: 'Filter by user ID.' })
  @IsOptional()
  @IsString()
  userId?: string;
}
