import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class RenameChatDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Title must be at least 8 characters long' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title: string;
}
