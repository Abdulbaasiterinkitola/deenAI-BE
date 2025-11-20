import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class ConfirmDeleteUserDto {
  @ApiProperty({
    description: 'The confirmation code to verify user deletion',
    example: 1234,
  })
  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
  })
  @Max(4)
  @Min(4)
  @IsNotEmpty()
  confirmationCode!: number;
}
