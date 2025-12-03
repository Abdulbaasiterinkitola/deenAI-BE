import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateReciterDto {
  @ApiProperty()
  @IsString()
  reciterName: string;

  @ApiProperty()
  @IsString()
  surah: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  duration?: number;
}
