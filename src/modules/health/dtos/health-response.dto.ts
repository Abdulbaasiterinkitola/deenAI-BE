import { ApiProperty } from '@nestjs/swagger';

export class MemoryMetricsDto {
  @ApiProperty({ example: 52428800, description: 'Memory used in bytes' })
  used: number;

  @ApiProperty({ example: 134217728, description: 'Total memory in bytes' })
  total: number;

  @ApiProperty({ example: 39.06, description: 'Memory usage percentage' })
  percentage: number;

  @ApiProperty({ example: 5, description: 'Number of active connections' })
  activeConnections: number;
}

export class DependencyStatusDto {
  @ApiProperty({ example: 'up', enum: ['up', 'down'] })
  status: 'up' | 'down';

  @ApiProperty({ example: 12.5, description: 'Response time in milliseconds' })
  responseTime: number;

  @ApiProperty({
    example: 'Connected successfully',
    required: false,
    description: 'Additional status message',
  })
  message?: string;
}

export class DependenciesDto {
  @ApiProperty({ type: DependencyStatusDto })
  database: DependencyStatusDto;

  @ApiProperty({ type: DependencyStatusDto })
  redis: DependencyStatusDto;

  @ApiProperty({ type: DependencyStatusDto })
  smtp: DependencyStatusDto;

  @ApiProperty({ type: DependencyStatusDto })
  externalApi: DependencyStatusDto;
}

export class DetailedHealthResponseDto {
  @ApiProperty({
    example: 'healthy',
    enum: ['healthy', 'degraded', 'unhealthy'],
    description: 'Overall system health status',
  })
  status: 'healthy' | 'degraded' | 'unhealthy';

  @ApiProperty({
    example: '2024-11-30T20:30:00.000Z',
    description: 'Timestamp of health check',
  })
  timestamp: string;

  @ApiProperty({ example: 3600, description: 'Application uptime in seconds' })
  uptime: number;

  @ApiProperty({ type: MemoryMetricsDto })
  memory: MemoryMetricsDto;

  @ApiProperty({ type: DependenciesDto })
  dependencies: DependenciesDto;
}

export class LivenessResponseDto {
  @ApiProperty({ example: 'alive', description: 'Liveness status' })
  status: 'alive';

  @ApiProperty({
    example: '2024-11-30T20:30:00.000Z',
    description: 'Timestamp',
  })
  timestamp: string;
}

export class ReadinessResponseDto {
  @ApiProperty({
    example: 'ready',
    enum: ['ready', 'not_ready'],
    description: 'Readiness status',
  })
  status: 'ready' | 'not_ready';

  @ApiProperty({
    example: { database: 'up', redis: 'up' },
    description: 'Critical dependencies status',
  })
  critical_dependencies: {
    database: 'up' | 'down';
    redis: 'up' | 'down';
  };

  @ApiProperty({
    example: '2024-11-30T20:30:00.000Z',
    description: 'Timestamp',
  })
  timestamp: string;
}
