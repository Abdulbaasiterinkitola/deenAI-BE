import { ApiProperty } from '@nestjs/swagger';

export class StatusBreakdownDto {
  @ApiProperty({ description: 'Number of active users', example: 150 })
  active: number;

  @ApiProperty({ description: 'Number of paused users', example: 10 })
  paused: number;
}

export class StatsOverviewDto {
  @ApiProperty({ description: 'Total number of users', example: 160 })
  totalUsers: number;

  @ApiProperty({ description: 'Number of active users', example: 150 })
  activeUsers: number;

  @ApiProperty({ description: 'Number of paused users', example: 10 })
  pausedUsers: number;

  @ApiProperty({
    description: 'Number of new users in the last 7 days',
    example: 25,
  })
  newUsersLast7Days: number;

  @ApiProperty({
    description: 'Number of new users in the last 30 days',
    example: 85,
  })
  newUsersLast30Days: number;

  @ApiProperty({
    description: 'Breakdown of users by status',
    type: StatusBreakdownDto,
  })
  statusBreakdown: StatusBreakdownDto;
}

