import { AbstractBaseEntity } from '@entities/base.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '@modules/users/models/user.model';

@Entity({ name: 'reflections' })
export class Reflection extends AbstractBaseEntity {
  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({
    name: 'type',
    type: 'varchar',
    length: 20,
    nullable: false,
    default: 'quran',
  })
  type: 'quran' | 'hadith';

  @Column({ name: 'surah', type: 'int', nullable: true })
  surah: number | null;

  @Column({ name: 'start_ayah', type: 'int', nullable: true })
  startAyah: number | null;

  @Column({ name: 'end_ayah', type: 'int', nullable: true })
  endAyah: number | null;

  @Column({
    name: 'collection_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  collectionId: string | null;

  @Column({ name: 'hadith_number', type: 'int', nullable: true })
  hadithNumber: number | null;

  @Column({ name: 'book_number', type: 'int', nullable: true })
  bookNumber: number | null;

  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  userId: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
