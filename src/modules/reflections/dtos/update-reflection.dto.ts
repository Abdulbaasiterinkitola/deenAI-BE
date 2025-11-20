import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class UpdateReflectionDto {
  @ApiProperty({
    description: 'The content of the reflection',
    example:
      'Today I learned about the importance of patience in software development.',
  })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Reflection content cannot be empty' })
  @MaxLength(5000, {
    message: 'Reflection content cannot exceed 5000 characters',
  })
  content: string;
}
