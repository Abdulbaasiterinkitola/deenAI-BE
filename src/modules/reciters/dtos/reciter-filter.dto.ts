import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReciterFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reciterName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  surah?: string;

  @ApiPropertyOptional({ description: 'Surah number (1-114)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(114)
  surahNumber?: number;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;
}
