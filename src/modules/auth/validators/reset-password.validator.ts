import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class ResetPasswordBodyValidator {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must contain uppercase, lowercase, and a number or symbol.',
  })
  newPassword: string;
}
