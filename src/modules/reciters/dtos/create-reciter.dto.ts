import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateReciterDto {
  @ApiProperty({ description: 'Name of the reciter' })
  @IsString({ message: 'Reciter name must be a string' })
  reciterName: string;

  @ApiProperty({ description: 'Surah associated with the reciter' })
  @IsString({ message: 'Surah must be a string' })
  surah: string;

  @ApiProperty({ description: 'Duration in seconds', required: false })
  @IsOptional()
  @IsInt({ message: 'Duration must be an integer' })
  @Min(1, { message: 'Duration must be at least 1 second' })
  duration?: number;
}
