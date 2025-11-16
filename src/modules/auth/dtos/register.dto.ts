import { ApiProperty } from '@nestjs/swagger';

export default class RegisterDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
  })
  name: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  email: string;

  @ApiProperty({
    example: 'Password@123',
    description: 'User password that meets security requirements',
  })
  password: string;
}
