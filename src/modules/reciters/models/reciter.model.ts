import { Entity, Column, Index } from 'typeorm';
import { AbstractBaseEntity } from '@entities/base.entity';

@Entity('reciters')
@Index(['reciterName'])
export class Reciter extends AbstractBaseEntity {
  @Column({ name: 'reciter_name' })
  reciterName: string;

  @Column({ name: 'surah' })
  surah: string;

  @Column({ name: 'surah_number', type: 'integer' })
  @Index()
  surahNumber: number;

  @Column({ name: 'file_path' })
  filePath: string;

  @Column({ name: 'file_size', type: 'bigint' })
  fileSize: number;

  // optional duration in seconds
  @Column({ name: 'duration', type: 'integer', nullable: true })
  duration?: number;
}
