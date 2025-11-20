import { IsString, IsNotEmpty, IsEmail, Matches, MinLength } from 'class-validator';

export class ResetPasswordBodyValidator {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!])[A-Za-z\d@#$%^&*!]{8,}$/, {
    message: 'Password must contain at least 8 characters with uppercase, lowercase, number, and special character'
  })
  newPassword: string;
}
