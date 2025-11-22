import { ApiProperty } from '@nestjs/swagger';
import { Plan, PlanInterval } from '../models/plan.model';

export class PlanResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty({ nullable: true, example: '1100.00' })
  price: string | null;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiProperty({ enum: PlanInterval })
  interval: PlanInterval;

  @ApiProperty()
  isPopular: boolean;

  @ApiProperty()
  isCustom: boolean;

  @ApiProperty()
  displayOrder: number;

  @ApiProperty({ type: [String] })
  features: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(plan: Plan): PlanResponseDto {
    return {
      id: plan.id,
      name: plan.name,
      slug: plan.slug,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      interval: plan.interval,
      isPopular: plan.isPopular,
      isCustom: plan.isCustom,
      displayOrder: plan.displayOrder,
      features: plan.features || [],
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }
}
