import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AbstractBaseEntity } from '@entities/base.entity';
import { User } from '@modules/users/models/user.model';

@Entity('newsletter_subscriptions')
export class NewsletterSubscription extends AbstractBaseEntity {
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @Index('idx_newsletter_email', { unique: true })
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Index('idx_newsletter_subscribed')
  @Column({ name: 'is_subscribed', type: 'boolean', default: true })
  isSubscribed: boolean;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;
}
