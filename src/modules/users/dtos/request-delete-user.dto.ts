import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteUserDto {
  @ApiProperty({
    description: 'The unique identifier of the user to delete',
    example: 'uuid-string',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
