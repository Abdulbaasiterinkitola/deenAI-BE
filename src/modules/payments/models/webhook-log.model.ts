import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('webhook_logs')
export class WebhookLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  provider: string;

  @Column()
  eventType: string;

  @Column('text')
  payload: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ default: 'received' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
