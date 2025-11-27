import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class SaveProfileDto {
  @IsOptional()
  avatar?: string | null;

  @IsOptional()
  @IsString({ message: 'Language must be a string' })
  @MinLength(2, { message: 'Language code must be at least 2 characters' })
  @MaxLength(10, { message: 'Language code must not exceed 10 characters' })
  language?: string | null;

  @IsOptional()
  @IsString({ message: 'Username must be a string' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(30, { message: 'Username must not exceed 30 characters' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username?: string | null;

  @IsOptional()  
  @IsString({ message: 'Name must be a string' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @MaxLength(30, { message: 'Name must not exceed 30 characters' })
  @Matches(/^[a-zA-Z]+$/, {
    message: 'Name can only contain letters',
  })
  name?: string | null;
}
