import { AbstractBaseEntity } from '@entities/base.entity';
import { Column, Entity } from 'typeorm';

export enum PlanInterval {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

@Entity({ name: 'plans' })
export class Plan extends AbstractBaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: string | null;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'varchar', length: 20, default: PlanInterval.MONTHLY })
  interval: PlanInterval;

  @Column({ name: 'is_popular', type: 'boolean', default: false })
  isPopular: boolean;

  @Column({ name: 'is_custom', type: 'boolean', default: false })
  isCustom: boolean;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @Column({ type: 'text', array: true, default: '{}' })
  features: string[];
}
