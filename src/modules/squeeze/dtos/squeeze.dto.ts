import { IsEmail, IsOptional, IsNotEmpty } from 'class-validator';

export class SqueezeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsNotEmpty()
  name?: string;
}
