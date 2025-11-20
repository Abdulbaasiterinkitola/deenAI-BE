import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MinLength,
  MaxLength,
} from 'class-validator';

/**
 * DTO for sending a message in a chat
 */
export class SendMessageDto {
  @ApiProperty({
    description: 'The message content from the user',
    example: 'What is the meaning of patience in Islam?',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1, { message: 'Message content cannot be empty' })
  @MaxLength(5000, {
    message: 'Message content cannot exceed 5000 characters',
  })
  message: string;
}

/**
 * DTO for chat ID parameter
 */
export class ChatIdDto {
  @ApiProperty({
    description: 'The unique identifier of the chat',
    example: 'a7e92c4e-3f21-4a5d-a8ae-57b923f1eac7',
  })
  @IsUUID()
  id: string;
}
