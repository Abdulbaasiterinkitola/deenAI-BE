import { AbstractBaseEntity } from '@entities/base.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { AuthProvider } from '../enums';
import { Plan } from '@modules/plans/models/plan.model';

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

  @ManyToOne(() => Plan, { nullable: true })
  @JoinColumn({ name: 'plan_id' })
  plan: Plan | null;
}
