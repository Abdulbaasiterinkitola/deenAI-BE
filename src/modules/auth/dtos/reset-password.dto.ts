import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'jwt-reset-token-here',
    description: 'Token sent in the reset password email',
  })
  token: string;

  @ApiProperty({
    example: 'NewPassword@123',
    description: 'New password meeting security requirements',
  })
  newPassword: string;
}
