import { AbstractBaseEntity } from '@entities/base.entity';
import { Column, Entity, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AuthProvider } from '../enums';
import { Plan } from '@modules/plans/models/plan.model';
import { UserStatus } from '../enums/user-status.enum';

@Entity({ name: 'users' })
export class User extends AbstractBaseEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({
    type: 'varchar',
    default: AuthProvider.LOCAL,
    nullable: false,
  })
  authProvider: AuthProvider;

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @Column({
    name: 'current_refresh_token',
    type: 'varchar',
    nullable: true,
    select: false,
  })
  currentRefreshToken: string | null;

  @Column({ name: 'plan_id', type: 'uuid', nullable: true })
  planId: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  timezone: string | null;

  @Column({
    name: 'current_period_start',
    type: 'timestamp with time zone',
    default: () => 'NOW()',
    nullable: true,
  })
  currentPeriodStart: Date | null;

  @ManyToOne(() => Plan, { nullable: true })
  @JoinColumn({ name: 'plan_id' })
  plan: Plan | null;

  @Index()
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ name: 'failed_login_attempts', type: 'int', default: 0 })
  failedLoginAttempts: number;

  @Column({ name: 'account_locked_until', type: 'timestamp', nullable: true })
  accountLockedUntil: Date | null;

  @Column({ name: 'last_failed_login', type: 'timestamp', nullable: true })
  lastFailedLogin: Date | null;
}
