import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { AbstractBaseEntity } from '@entities/base.entity';
import { User } from '@modules/users/models/user.model';

@Entity('profiles')
export class Profile extends AbstractBaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true, type: 'text' })
  avatar: string | null;

  @Column({ nullable: true, type: 'varchar', length: 10 })
  language: string | null;

  @Column({ nullable: true, type: 'varchar', length: 30, unique: true })
  username: string | null;
}
