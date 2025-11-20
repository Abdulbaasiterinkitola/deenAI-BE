import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  MinLength,
  MaxLength,
  IsInt,
  Min,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for creating a new reflection
 */
export class CreateReflectionDto {
  @ApiProperty({
    description: 'The number of the start Ayah',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  startAyah: number;

  @ApiProperty({
    description: 'The number of the end Ayah',
    example: 10,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  endAyah: number;

  @ApiProperty({
    description: 'The number of the Surah',
    example: 32,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  surah: number;

  @ApiProperty({
    description: 'The content of the reflection',
    example:
      'Today I learned about the importance of patience in software development.',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1, { message: 'Reflection content cannot be empty' })
  @MaxLength(5000, {
    message: 'Reflection content cannot exceed 5000 characters',
  })
  content: string;
}

/**
 * DTO for updating a reflection
 */
export class UpdateReflectionDto {
  @ApiProperty({
    description: 'The updated content of the reflection',
    example: 'Updated reflection content with new insights.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Reflection content cannot be empty' })
  @MaxLength(10000, {
    message: 'Reflection content cannot exceed 10,000 characters',
  })
  content?: string;
}

/**
 * DTO for reflection query parameters
 */
export class ReflectionQueryDto {
  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    required: false,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiProperty({
    description: 'Order direction for sorting reflections by creation date',
    example: 'DESC',
    required: false,
    default: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  orderBy?: 'ASC' | 'DESC';
}

/**
 * DTO for reflection ID parameter
 */
export class ReflectionIdDto {
  @ApiProperty({
    description: 'The unique identifier of the reflection',
    example: 'a7e92c4e-3f21-4a5d-a8ae-57b923f1eac7',
  })
  @IsUUID()
  id: string;
}
