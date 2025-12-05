import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class HadithQueryDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page must be an integer' })
  @Min(1, { message: 'page must be at least 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit must be an integer' })
  @Min(1, { message: 'limit must be at least 1' })
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Search term to filter collections by name',
    example: '',
  })
  @IsOptional()
  search?: string;
}
