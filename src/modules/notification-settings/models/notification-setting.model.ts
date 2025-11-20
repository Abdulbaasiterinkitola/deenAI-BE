import { AbstractBaseEntity } from '@entities/base.entity';
import { User } from '@modules/users/models/user.model';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity({ name: 'notification_settings' })
export class NotificationSettings extends AbstractBaseEntity {
  @Column({ name: 'prayer_reminder', nullable: false, default: true })
  prayerReminder: boolean;

  @Column({ name: 'reflection_reminder', nullable: false, default: true })
  reflectionReminder: boolean;

  @Column({ name: 'ai_alerts', nullable: false, default: true })
  aiAlerts: boolean;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @OneToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
