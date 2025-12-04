import {
  IsEmail,
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '@modules/users/enums/user-status.enum';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Email address of the user',
    example: 'jane.doe@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Full name of the user',
    example: 'Jane Doe',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Plan ID assigned to the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  planId?: string;

  @ApiPropertyOptional({
    description: 'Whether the user is a superadmin',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isSuperadmin?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the user email is verified',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;
}
