import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class ConfirmAccountDeletionValidator {
  @IsString()
  @IsNotEmpty({ message: 'OTP is required' })
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  @Matches(/^\d+$/, { message: 'OTP must contain only numbers' })
  otp: string;
}
