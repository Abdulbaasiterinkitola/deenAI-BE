import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNotificationSettingsDto {
  @ApiPropertyOptional({ description: 'Prayer reminder toggle' })
  @IsOptional()
  @IsBoolean()
  prayerReminder?: boolean;

  @ApiPropertyOptional({ description: 'Reflection reminder toggle' })
  @IsOptional()
  @IsBoolean()
  reflectionReminder?: boolean;

  @ApiPropertyOptional({ description: 'AI alerts toggle' })
  @IsOptional()
  @IsBoolean()
  aiAlerts?: boolean;

  @ApiPropertyOptional({ description: 'Athkar notifications toggle' })
  @IsOptional()
  @IsBoolean()
  athkarNotificationsEnabled?: boolean;
}
