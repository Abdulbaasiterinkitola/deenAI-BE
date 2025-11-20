import { AbstractBaseEntity } from '@entities/base.entity';
import { Column, Entity, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '@modules/users/models/user.model';
import { ChatMessage } from './chat-message.model';

@Entity({ name: 'chats' })
export class Chat extends AbstractBaseEntity {
  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  userId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string | null;

  @Column({
    name: 'has_title',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  hasTitle: boolean;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => ChatMessage, (message) => message.chat, { cascade: true })
  messages: ChatMessage[];
}
