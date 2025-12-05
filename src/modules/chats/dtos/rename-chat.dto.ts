import { MaxLength } from 'class-validator';

export class RenameChatDto {
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title: string;
}
