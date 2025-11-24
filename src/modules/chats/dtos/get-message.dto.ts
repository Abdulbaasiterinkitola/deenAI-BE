import { IsOptional, IsNumberString } from 'class-validator';

export class GetMessagesQueryDto {
  @IsOptional()
  @IsNumberString()
  page?: string;
}
