import { ApiProperty } from '@nestjs/swagger';

export class NewPlanDto {
  @ApiProperty({
    description: 'Plan ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Plan name',
    example: 'Premium (Monthly)',
  })
  name: string;

  @ApiProperty({
    description: 'Plan slug',
    example: 'premium-monthly',
  })
  slug: string;
}
