import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ReciterFilterDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 10 })
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
  limit?: number;
  @Max(114)
  surahNumber?: number;

  @ApiPropertyOptional({ example: 'Mishary Alafasy' })
  @IsOptional()
  @IsString()
  reciterName?: string;

  @ApiPropertyOptional({ example: 'Al-Fatihah' })
  @IsOptional()
  @IsString()
  surah?: string;

  // removed startAyah and endAyah from the DTO per design decision
}
