import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ReciterFilterDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

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
