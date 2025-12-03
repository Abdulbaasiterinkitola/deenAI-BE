import { IsArray, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UserFilterDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  plan?: string;

  @IsOptional()
  registrationDateFrom?: Date;

  @IsOptional()
  registrationDateTo?: Date;

  @IsOptional()
  lastActivityFrom?: Date;
}

export class SendBulkPushDto {
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  userIds?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => UserFilterDto)
  filters?: UserFilterDto;

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
