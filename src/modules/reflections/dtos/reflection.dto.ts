import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  MinLength,
  MaxLength,
  IsInt,
  Min,
  IsIn,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationMetaDto } from '@shared/dtos/pagination-meta.dto';

/**
 * DTO for creating a new reflection
 */
export class CreateReflectionDto {
  @ApiProperty({
    description: 'Type of the reflection source',
    enum: ['quran', 'hadith'],
    example: 'quran',
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['quran', 'hadith'])
  type: 'quran' | 'hadith';

  @ApiProperty({
    description: 'The number of the start Ayah',
    example: 1,
    required: false,
  })
  @ValidateIf((dto) => dto.type === 'quran')
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  startAyah?: number;

  @ApiProperty({
    description: 'The number of the end Ayah',
    example: 10,
    required: false,
  })
  @ValidateIf((dto) => dto.type === 'quran')
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  endAyah?: number;

  @ApiProperty({
    description: 'The number of the Surah',
    example: 32,
    required: false,
  })
  @ValidateIf((dto) => dto.type === 'quran')
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  surah?: number;

  @ApiProperty({
    description: 'Hadith number within the collection',
    example: 1234,
    required: false,
  })
  @ValidateIf((dto) => dto.type === 'hadith')
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  hadithNumber?: number;

  @ApiProperty({
    description: 'Hadith collection identifier (e.g., bukhari)',
    example: 'bukhari',
    required: false,
  })
  @ValidateIf((dto) => dto.type === 'hadith')
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  collectionId?: string;

  @ApiProperty({
    description: 'Book number inside the collection',
    example: 5,
    required: false,
  })
  @ValidateIf((dto) => dto.type === 'hadith')
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  bookNumber?: number;

  @ApiProperty({
    description: 'The content of the reflection',
    example:
      'Today I learned about the importance of patience in software development.',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1, { message: 'Reflection content cannot be empty' })
  @MaxLength(5000, {
    message: 'Reflection content cannot exceed 5000 characters',
  })
  content: string;
}

/**
 * DTO for updating a reflection
 */
export class UpdateReflectionDto {
  @ApiProperty({
    description: 'The updated content of the reflection',
    example: 'Updated reflection content with new insights.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Reflection content cannot be empty' })
  @MaxLength(10000, {
    message: 'Reflection content cannot exceed 10,000 characters',
  })
  content?: string;
}

/**
 * DTO for reflection query parameters
 */
export class ReflectionQueryDto {
  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    required: false,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiProperty({
    description: 'Order direction for sorting reflections by creation date',
    example: 'DESC',
    required: false,
    default: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  orderBy?: 'ASC' | 'DESC';

  @ApiProperty({
    description: 'Search term to filter reflections by content',
    example: 'patience',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}

/**
 * DTO for reflection ID parameter
 */
export class ReflectionIdDto {
  @ApiProperty({
    description: 'The unique identifier of the reflection',
    example: 'a7e92c4e-3f21-4a5d-a8ae-57b923f1eac7',
  })
  @IsUUID()
  id: string;
}

export class ReflectionResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the reflection',
    example: 'a7e92c4e-3f21-4a5d-a8ae-57b923f1eac7',
  })
  id: string;

  @ApiProperty({
    description: 'Content of the reflection',
    example: 'Today I learned about the importance of patience.',
  })
  content: string;

  @ApiProperty({
    description: 'Source type of the reflection',
    enum: ['quran', 'hadith'],
    example: 'quran',
  })
  type: 'quran' | 'hadith';

  @ApiPropertyOptional({
    description: 'Surah number',
    example: 32,
  })
  surah?: number | null;

  @ApiPropertyOptional({
    description: 'Start ayah number',
    example: 1,
  })
  startAyah?: number | null;

  @ApiPropertyOptional({
    description: 'End ayah number',
    example: 5,
  })
  endAyah?: number | null;

  @ApiPropertyOptional({
    description: 'Hadith collection identifier',
    example: 'bukhari',
  })
  collectionId?: string | null;

  @ApiPropertyOptional({
    description: 'Hadith number',
    example: 1234,
  })
  hadithNumber?: number | null;

  @ApiPropertyOptional({
    description: 'Hadith book number',
    example: 5,
  })
  bookNumber?: number | null;

  @ApiProperty({
    description: 'User identifier',
    example: 'b8f03d5f-4g32-5b6e-b9bf-68c034g2fbd8',
  })
  userId: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-01-01T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Update timestamp',
    example: '2025-01-01T12:00:00.000Z',
  })
  updatedAt: Date;
}

export class PaginatedReflectionsResponseDto {
  @ApiProperty({ type: [ReflectionResponseDto] })
  payload: ReflectionResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  paginationMeta: PaginationMetaDto;
}
