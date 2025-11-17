import { IsEmail, IsOptional, IsNotEmpty } from 'class-validator';

export class WaitlistDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsNotEmpty()
  name?: string;
}
