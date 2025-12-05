import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateReciterDto {
  @ApiProperty()
  @IsString()
  reciterName: string;

  @ApiProperty()
  @IsString()
  surah: string;

  @ApiProperty({ description: 'Surah number (1-114)', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(114)
  surahNumber?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  duration?: number;
}
