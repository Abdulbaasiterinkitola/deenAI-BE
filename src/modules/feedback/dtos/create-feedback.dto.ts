import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty({
    example: 'App feedback',
    description: 'Short title of the feedback',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: 'I love the app but it needs dark mode.',
    description: 'Detailed feedback message',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
