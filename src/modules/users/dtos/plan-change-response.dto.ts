import { ApiProperty } from '@nestjs/swagger';

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
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Premium (Monthly)',
      slug: 'premium-monthly',
    },
  })
  newPlan: {
    id: string;
    name: string;
    slug: string;
  };
}
