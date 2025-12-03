import { ApiProperty } from '@nestjs/swagger';

export class ReciterResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  reciterName: string;

  @ApiProperty()
  surah: string;

  @ApiProperty()
  surahNumber: number;

  @ApiProperty()
  fileSize: number;

  @ApiProperty({ required: false })
  duration?: number | null;

  @ApiProperty()
  downloadUrl: string;

  @ApiProperty()
  createdAt: Date;
}
