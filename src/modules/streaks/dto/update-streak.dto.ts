import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601 } from 'class-validator';

export class UpdateStreakDto {
  @ApiProperty({
    description:
      'UTC timestamp representing when the daily streak action was completed. Must be an ISO 8601 string ending with "Z".',
    example: '2025-01-15T12:00:00.000Z',
  })
  @IsISO8601({ strict: true })
  completedAt: string;
}

