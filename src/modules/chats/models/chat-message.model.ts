import { AbstractBaseEntity } from '@entities/base.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { Chat } from './chat.model';

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

@Entity({ name: 'chat_messages' })
export class ChatMessage extends AbstractBaseEntity {
  @Column({ name: 'chat_id', type: 'uuid', nullable: false })
  chatId: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: false,
    enum: MessageRole,
  })
  role: MessageRole;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ type: 'varchar', nullable: true })
  reference: string | null;

  @Column({ name: 'reference_link', type: 'varchar', nullable: true })
  referenceLink: string | null;

  @ManyToOne(() => Chat, (chat) => chat.messages, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chat_id' })
  chat: Chat;
}
