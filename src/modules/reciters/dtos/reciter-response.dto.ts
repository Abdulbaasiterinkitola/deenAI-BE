import { ApiProperty } from '@nestjs/swagger';

export class ReciterResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  reciterName: string;

  @ApiProperty()
  surah: string;

  @ApiProperty()
  fileSize: number;

  @ApiProperty()
  downloadUrl: string;

  @ApiProperty()
  createdAt: Date;
}
