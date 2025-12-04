import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CollectionType } from '../model/collection-model';

export class CreateCollectionDto {
  @ApiProperty({
    description: 'Type of the collection (hadith, duaa, athkar, etc.)',
    enum: CollectionType,
    example: CollectionType.hadith,
  })
  @IsNotEmpty()
  @IsEnum(CollectionType)
  type: CollectionType;

  @ApiProperty({
    description: 'Name of the collection',
    example: 'Sahih Bukhari',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the collection content',
    example: 'Authentic hadith collection by Imam Bukhari',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Language code (e.g., en, ar)',
    example: 'en',
  })
  @IsNotEmpty()
  @IsString()
  language: string;

  @ApiProperty({
    description: 'Version string',
    example: '1.0.0',
  })
  @IsNotEmpty()
  @IsString()
  version: string;

  @ApiProperty({
    description: 'Additional metadata in JSON format',
    required: false,
    example: '{"source": "sunnah.com", "license": "CC0"}',
  })
  @IsOptional()
  // We can accept a stringified JSON or an object depending on how multipart handles it.
  // Usually multipart sends objects as JSON strings.
  metadata?: string;
}

export class UploadCollectionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  version: string;

  @ApiProperty()
  originalSize: number;

  @ApiProperty()
  compressedSize: number;

  @ApiProperty()
  compressionRatio: number;

  @ApiProperty()
  message: string;
}
