import { Entity, Column } from 'typeorm';
import { AbstractBaseEntity } from '@entities/base.entity';

@Entity('password_reset_otp')
export class PasswordResetOtp extends AbstractBaseEntity {
  @Column()
  email: string;

  @Column()
  otp: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'is_verified', default: false, select: true })
  isVerified: boolean;

  @Column({ name: 'used_at', type: 'timestamp', nullable: true })
  usedAt: Date | null;
}
