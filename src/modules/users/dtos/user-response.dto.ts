import { ApiProperty } from '@nestjs/swagger';
import { AuthProvider } from '../enums';

export class UserResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiProperty({ example: 'John Doe' })
  name!: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email!: string;

  @ApiProperty({ example: AuthProvider.LOCAL })
  authProvider!: AuthProvider;

  @ApiProperty({ example: true })
  isEmailVerified!: boolean;

  @ApiProperty({ example: '2023-01-01T12:00:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2023-01-01T12:00:00Z' })
  updatedAt!: Date;
}
