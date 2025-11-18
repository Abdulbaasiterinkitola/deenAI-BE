import { AbstractBaseEntity } from '@entities/base.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '@modules/users/models/user.model';

@Entity({ name: 'reflections' })
export class Reflection extends AbstractBaseEntity {
  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ name: 'user_id', type: 'text', nullable: false })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}