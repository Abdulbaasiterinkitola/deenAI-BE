import { AbstractBaseEntity } from '@entities/base.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '@modules/users/models/user.model';

@Entity({ name: 'reflections' })
export class Reflection extends AbstractBaseEntity {
  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ name: 'surah', type: 'int', nullable: false })
  surah: number;

  @Column({ name: 'start_ayah', type: 'int', nullable: false })
  startAyah: number;

  @Column({ name: 'end_ayah', type: 'int', nullable: false })
  endAyah: number;

  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  userId: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
