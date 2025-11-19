import { IsString, IsNotEmpty, Length, IsEmail } from 'class-validator';

export class ResetPasswordBodyValidator {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 128)
  newPassword: string;
}
