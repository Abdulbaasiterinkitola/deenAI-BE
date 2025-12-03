import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateReciterDto {
  @ApiProperty()
  @IsString()
  reciterName: string;

  @ApiProperty()
  @IsString()
  surah: string;

  @ApiProperty({ description: 'Surah number (1-114)' })
  @IsInt()
  @Min(1)
  @Max(114)
  surahNumber: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  duration?: number;
}
