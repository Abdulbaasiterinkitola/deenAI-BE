import { AbstractBaseEntity } from '@entities/base.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { Chat } from './chat.model';
import { AIReference } from '../types';

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

  @Column({
    name: 'ai_references',
    type: 'jsonb',
    nullable: true,
    default: null,
  })
  aiReferences: AIReference[] | null;

  @ManyToOne(() => Chat, (chat) => chat.messages, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chat_id' })
  chat: Chat;
}
