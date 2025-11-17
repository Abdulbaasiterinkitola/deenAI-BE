import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateWaitlistDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email: string;
}
