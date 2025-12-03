import { Entity, Column, Index } from 'typeorm';
import { AbstractBaseEntity } from '@entities/base.entity';

@Entity('reciters')
export class Reciter extends AbstractBaseEntity {
  @Column({ name: 'reciter_name' })
  @Index()
  reciterName: string;

  @Column({ name: 'surah' })
  @Index()
  surah: string;

  @Column({ name: 'surah_number', type: 'integer' })
  @Index()
  surahNumber: number;

  @Column({ name: 'file_path' })
  filePath: string;

  @Column({ name: 'file_size', type: 'bigint' })
  fileSize: number;

  @Column({ name: 'duration', type: 'integer', nullable: true })
  duration?: number | null;
}
