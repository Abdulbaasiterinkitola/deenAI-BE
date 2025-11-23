import { ApiProperty } from '@nestjs/swagger';
import { NewPlanDto } from './new-plan.dto';

export class PlanChangeResponseDto {
  @ApiProperty({
    description: 'Whether the plan change was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Message describing the result',
    example: 'Plan changed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Details of the new plan',
    type: NewPlanDto,
  })
  newPlan: NewPlanDto;
}
