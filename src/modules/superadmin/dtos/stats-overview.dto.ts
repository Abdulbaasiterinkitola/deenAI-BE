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

export class UserGrowthPoint {
  @ApiProperty({
    description: 'Timestamp for the period',
    example: '2025-01-15T00:00:00.000Z',
  })
  timestamp!: string;

  @ApiProperty({
    description: 'Number of users registered in this period',
    example: 25,
  })
  count!: number;

  @ApiProperty({
    description: 'Cumulative count of users up to this period',
    example: 150,
  })
  cumulative!: number;

  @ApiProperty({
    description: 'Growth rate percentage compared to previous period',
    example: 12.5,
    required: false,
  })
  growthRate?: number | null;
}

export class UserGrowthDto {
  @ApiProperty({
    description: 'Time period granularity',
    enum: ['day', 'week', 'month'],
    example: 'day',
  })
  period!: 'day' | 'week' | 'month';

  @ApiProperty({
    description: 'Time series data points for user growth',
    type: [UserGrowthPoint],
  })
  points!: UserGrowthPoint[];
}

export class UserEngagementDto {
  @ApiProperty({
    description: 'Number of users who have active streaks (current_streak > 0)',
    example: 45,
  })
  usersWithStreaks!: number;

  @ApiProperty({
    description: 'Average streak length across all users with streaks',
    example: 12.5,
  })
  averageStreakLength!: number;

  @ApiProperty({
    description: 'Average highest streak length across all users',
    example: 18.3,
  })
  averageHighestStreak!: number;

  @ApiProperty({
    description:
      'Number of unique users who have created at least one reflection',
    example: 120,
  })
  usersWithReflections!: number;

  @ApiProperty({
    description:
      'Number of unique users who have created at least one bookmark',
    example: 85,
  })
  usersWithBookmarks!: number;

  @ApiProperty({
    description: 'Number of unique users who have created at least one chat',
    example: 95,
  })
  usersWithChats!: number;

  @ApiProperty({
    description: 'Total number of reflections across all users',
    example: 450,
  })
  totalReflections!: number;

  @ApiProperty({
    description: 'Total number of bookmarks across all users',
    example: 320,
  })
  totalBookmarks!: number;

  @ApiProperty({
    description: 'Total number of chats across all users',
    example: 180,
  })
  totalChats!: number;
}
