import { IsEmail, IsOptional } from 'class-validator';

export class SubscribeDto {
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;
}
