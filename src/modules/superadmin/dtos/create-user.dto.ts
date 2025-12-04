import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  IsBoolean,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AuthProvider } from '@modules/users/enums';
import { UserStatus } from '@modules/users/enums/user-status.enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password for the user (min 8 characters)',
    example: 'StrongP@ssw0rd!',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Status of the user',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty({
    description: 'Plan ID assigned to the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  planId?: string;

  @ApiProperty({
    description: 'Whether the user is a superadmin',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isSuperadmin?: boolean;

  @ApiProperty({
    description: 'Whether the user email is verified',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  @ApiProperty({
    description: 'Authentication provider',
    enum: AuthProvider,
    example: AuthProvider.LOCAL,
    required: false,
  })
  @IsOptional()
  @IsEnum(AuthProvider)
  authProvider?: AuthProvider;
}
