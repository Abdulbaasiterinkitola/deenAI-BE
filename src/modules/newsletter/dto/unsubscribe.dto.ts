import { IsEmail, IsOptional } from 'class-validator';

export class UnsubscribeDto {
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;
}
