import { AbstractBaseEntity } from '@entities/base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from '@modules/users/models/user.model';

@Entity({ name: 'streaks' })
export class Streak extends AbstractBaseEntity {
  @Column({
    name: 'type',
    type: 'varchar',
    length: 20,
    nullable: false,
    default: 'hadith',
  })
  type: 'quran' | 'hadith';

  @Column({ name: 'current_streak', nullable: false, default: 0 })
  currentStreak: number;

  @Column({ name: 'highest_streak', nullable: false, default: 0 })
  highestStreak: number;

  @Column({ name: 'last_completed_at', type: 'timestamp', nullable: true })
  lastCompletedAt: Date;

  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  userId: string;

  @OneToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
