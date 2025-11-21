import { AbstractBaseEntity } from '@entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { User } from '@modules/users/models/user.model';

@Entity({ name: 'bookmarks' })
@Unique(['userId', 'surah', 'ayah'])
export class Bookmark extends AbstractBaseEntity {
  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  userId: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', nullable: false })
  surah: number;

  @Column({ type: 'int', nullable: false })
  ayah: number;

  @Column({ type: 'text', nullable: true })
  translation?: string | null;

  @Column({ name: 'ayah_ar', type: 'text', nullable: true })
  ayahAr?: string | null;

  @Column({
    name: 'translation_language',
    type: 'varchar',
    length: 16,
    nullable: true,
  })
  translationLanguage?: string | null;
}
