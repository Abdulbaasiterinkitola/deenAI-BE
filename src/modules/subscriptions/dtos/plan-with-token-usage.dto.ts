import { ApiProperty } from '@nestjs/swagger';
import { PlanResponseDto } from '@modules/plans/dto/plan-response.dto';

export class PlanWithTokenUsageDto {
  @ApiProperty({ type: PlanResponseDto })
  plan: PlanResponseDto;

  @ApiProperty({
    description: 'Total tokens used in the current billing period',
    example: 50000,
  })
  tokensUsed: number;

  @ApiProperty({
    description: 'Total tokens available in the plan',
    example: 100000,
  })
  tokensLimit: number;

  @ApiProperty({
    description: 'Remaining tokens available in the current billing period',
    example: 50000,
  })
  tokensRemaining: number;

  @ApiProperty({
    description: 'Percentage of tokens used (0-100)',
    example: 50,
  })
  tokensUsedPercentage: number;

  @ApiProperty({
    description: 'Start date of the current billing cycle',
    example: '2025-01-15T10:00:00.000Z',
    nullable: true,
  })
  billingCycleStart: Date | null;

  @ApiProperty({
    description: 'Whether the user has reached their token limit',
    example: false,
  })
  isLimitReached: boolean;

  @ApiProperty({
    description: 'Whether the user is approaching their token limit (>= 80%)',
    example: false,
  })
  isApproachingLimit: boolean;
}

