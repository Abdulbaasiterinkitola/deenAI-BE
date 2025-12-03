import { IsString, IsUUID, IsOptional, ValidateNested } from 'class-validator';

export class SendPushDto {
  @IsUUID()
  userId: string;

  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsOptional()
  data?: Record<string, string>;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
