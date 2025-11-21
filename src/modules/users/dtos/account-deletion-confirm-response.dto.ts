import { ApiProperty } from '@nestjs/swagger';

export class AccountDeletionConfirmResponseDto {
  @ApiProperty({
    description: 'Indicates if the account deletion was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Account deleted successfully',
  })
  message: string;
}
