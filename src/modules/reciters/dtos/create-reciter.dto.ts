import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReciterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reciterName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  surah: string;

  @ApiProperty({ description: 'Surah number (1-114)' })
  @IsInt()
  @Min(1)
  @Max(114)
  surahNumber: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  duration?: number;
}
