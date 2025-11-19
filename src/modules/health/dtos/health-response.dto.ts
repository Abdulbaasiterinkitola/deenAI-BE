import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ example: 'ok' })
  status: string;

  @ApiProperty({
    example: {
      database: 'up',
      uptime: '125s',
    },
  })
  services: Record<string, any>;

  @ApiProperty({ example: '2025-03-03T12:00:00.000Z' })
  timestamp: string;
}
