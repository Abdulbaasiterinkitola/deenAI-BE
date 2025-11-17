import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

// waitlis dto
export class EmailDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  template: string;
}
