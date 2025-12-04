import { AbstractBaseEntity } from '@entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, Index } from 'typeorm';
import { User } from '@modules/users/models/user.model';
import { Plan } from '@modules/plans/models/plan.model';
import { PaymentPlatform, PaymentStatus } from '../enums/payment.enums';

@Entity({ name: 'payment_transactions' })
export class PaymentTransaction extends AbstractBaseEntity {
  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'plan_id', type: 'uuid', nullable: false })
  planId: string;

  @ManyToOne(() => Plan)
  @JoinColumn({ name: 'plan_id' })
  plan: Plan;

  @Column({
    type: 'enum',
    enum: PaymentPlatform,
    nullable: false,
  })
  platform: PaymentPlatform;

  @Index({ unique: true })
  @Column({ name: 'transaction_id', type: 'varchar', nullable: false })
  transactionId: string;

  @Column({ name: 'product_id', type: 'varchar', nullable: false })
  productId: string;

  @Column({ name: 'original_transaction_id', type: 'varchar', nullable: true })
  originalTransactionId: string | null;

  @Column({ name: 'purchase_date', type: 'timestamp', nullable: false })
  purchaseDate: Date;

  @Column({ name: 'expiration_date', type: 'timestamp', nullable: true })
  expirationDate: Date | null;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ name: 'is_trial_period', type: 'boolean', default: false })
  isTrialPeriod: boolean;

  @Column({
    name: 'is_introductory_price_period',
    type: 'boolean',
    default: false,
  })
  isIntroductoryPricePeriod: boolean;

  @Column({ name: 'raw_response', type: 'jsonb', nullable: true })
  rawResponse: Record<string, any> | null;
}
