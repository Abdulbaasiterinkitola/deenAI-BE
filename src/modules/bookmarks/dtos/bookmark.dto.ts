import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  IsIn,
  ValidateIf,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PaginationMetaDto } from '@shared/dtos/pagination-meta.dto';

export class CreateBookmarkDto {
  @ApiProperty({
    description: 'Surah number of the bookmarked ayah',
    example: 2,
    minimum: 1,
  })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  surah: number;

  @ApiProperty({
    description: 'Ayah number within the surah',
    example: 255,
    minimum: 1,
  })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  ayah: number;

  @ApiPropertyOptional({
    description: 'Optional translation for the ayah',
    example: 'Allah – there is no deity except Him, the Ever-Living...',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  translation?: string;

  @ApiPropertyOptional({
    description: 'Language/translation source identifier (e.g., en, ar, sahih)',
    example: 'en',
    maxLength: 32,
  })
  @ValidateIf((payload) => !!payload.translation)
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  translationLanguage?: string;

  @ApiPropertyOptional({
    description: 'Optional Arabic text for the ayah',
    example: 'اللَّهُ لَا إِلَـٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  ayahAr?: string;
}

export class BookmarkIdParamDto {
  @ApiProperty({
    description: 'Bookmark identifier',
    example: 'd9d7b8a8-1c23-4c3a-9c87-08e5edbf80ec',
  })
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class BookmarkQueryDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Order direction for sorting bookmarks by creation date',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  orderBy?: 'ASC' | 'DESC';
}

export class BookmarkResponseDto {
  @ApiProperty({
    description: 'Bookmark identifier',
    example: 'd9d7b8a8-1c23-4c3a-9c87-08e5edbf80ec',
  })
  id: string;

  @ApiProperty({ description: 'User identifier', example: 'e4e8...' })
  userId: string;

  @ApiProperty({ description: 'Surah number', example: 2 })
  surah: number;

  @ApiProperty({ description: 'Ayah number', example: 255 })
  ayah: number;

  @ApiPropertyOptional({
    description: 'Optional translation text',
    example: 'Allah – there is no deity except Him...',
  })
  translation?: string;

  @ApiPropertyOptional({
    description: 'Optional Arabic ayah text',
    example: 'اللَّهُ لَا إِلَـٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
  })
  ayahAr?: string | null;

  @ApiPropertyOptional({
    description: 'Optional translation language code',
    example: 'en',
  })
  translationLanguage?: string | null;

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

export class PaginatedBookmarksResponseDto {
  @ApiProperty({ type: [BookmarkResponseDto] })
  payload: BookmarkResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  paginationMeta: PaginationMetaDto;
}
