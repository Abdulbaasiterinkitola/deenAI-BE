import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum CollectionType {
  hadith = 'hadith',
  duaa = 'duaa',
  athkar = 'athkar',
  quran = 'quran',
  other = 'other',
}

export enum CompressionAlgorithm {
  gzip = 'gzip',
  brotli = 'brotli',
  deflate = 'deflate',
  none = 'none',
}

@Entity('collections')
@Index(['type', 'language', 'version'], { unique: true }) // Ensure unique version per type/lang
export class Collection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: CollectionType,
    default: CollectionType.other,
  })
  type: CollectionType;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  language: string;

  @Column()
  version: string;

  @Column({ name: 'original_file_path' })
  originalFilePath: string;

  @Column({ name: 'compressed_file_path', nullable: true })
  compressedFilePath: string;

  @Column({ name: 'original_size', type: 'bigint' }) // Store bytes
  originalSize: number;

  @Column({ name: 'compressed_size', type: 'bigint', nullable: true })
  compressedSize: number;

  @Column({ name: 'compression_ratio', type: 'float', nullable: true })
  compressionRatio: number;

  @Column({
    name: 'compression_algorithm',
    type: 'enum',
    enum: CompressionAlgorithm,
    default: CompressionAlgorithm.none,
  })
  compressionAlgorithm: CompressionAlgorithm;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
