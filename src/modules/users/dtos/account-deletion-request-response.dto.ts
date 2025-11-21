import { ApiProperty } from '@nestjs/swagger';

export class AccountDeletionRequestResponseDto {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Account deletion OTP sent to email',
  })
  message: string;
}
