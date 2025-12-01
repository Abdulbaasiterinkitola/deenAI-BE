import { IsString, IsNotEmpty, IsInt, Min, IsOptional } from 'class-validator';
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

  @ApiProperty()
  @IsInt()
  @Min(1)
  startAyah: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  endAyah: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  duration?: number;
}
