import { ApiProperty } from '@nestjs/swagger';

export class OverviewDto {
  @ApiProperty()
  totalAllTime!: number;

  @ApiProperty()
  totalLast7Days!: number;

  @ApiProperty()
  totalLast30Days!: number;

  @ApiProperty()
  averagePerUser!: number;

  @ApiProperty()
  inputTokens!: number;

  @ApiProperty()
  outputTokens!: number;
}

export class TimeSeriesPoint {
  @ApiProperty({ example: '2025-11-01T00:00:00.000Z' })
  timestamp!: string;

  @ApiProperty()
  input!: number;

  @ApiProperty()
  output!: number;

  @ApiProperty()
  total!: number;
}

export class TimeSeriesDto {
  @ApiProperty({ enum: ['hour', 'day', 'week'] })
  granularity!: 'hour' | 'day' | 'week';

  @ApiProperty({ type: [TimeSeriesPoint] })
  points!: TimeSeriesPoint[];
}

export class TopUserDto {
  @ApiProperty()
  userId!: string;

  @ApiProperty({ required: false })
  name?: string | null;

  @ApiProperty({ required: false })
  email?: string | null;

  @ApiProperty({ required: false })
  plan?: string | null;

  @ApiProperty()
  totalTokens!: number;
}

export class BreakdownDto {
  @ApiProperty()
  inputTokens!: number;

  @ApiProperty()
  outputTokens!: number;

  @ApiProperty()
  inputToOutputRatio!: number;

  @ApiProperty()
  avgPerRequest!: number;
}

export class PlanStatsDto {
  @ApiProperty({ required: false })
  planId!: string | null;

  @ApiProperty({ required: false })
  planName!: string | null;

  @ApiProperty()
  totalTokens!: number;

  @ApiProperty()
  avgPerUser!: number;

  @ApiProperty()
  percentageOfTotal!: number;
}

export class UserDetailDto {
  @ApiProperty()
  userId!: string;

  @ApiProperty()
  totalConsumed!: number;

  @ApiProperty()
  periodConsumed!: number;

  @ApiProperty()
  averagePerRequest!: number;

  @ApiProperty({ type: [TimeSeriesPoint] })
  history!: TimeSeriesPoint[];
}
