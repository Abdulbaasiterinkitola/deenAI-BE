import { Controller, Get, Param, Res, Query, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { HadithCollectionsService } from '../services/hadith-collection.service';
import { HadithQueryDto } from '../dto/hadithQuery.dto';
import { SuperadminGuard } from '@guards/superadmin.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('collections/hadith')
@ApiBearerAuth()
@UseGuards(SuperadminGuard)
export class HadithCollectionsController {
  constructor(private readonly hadithService: HadithCollectionsService) {}

  // LIST Hadith COLLECTIONS
  @Get()
  //   @listCollectionsDocs()
  async list(@Query() query: HadithQueryDto) {
    return await this.hadithService.listCollections(query);
  }

  // DOWNLOAD ORIGINAL
  @Get(':id/download')
  async downloadOriginal(@Param('id') id: string, @Res() res: Response) {
    return this.hadithService.downloadFile(id, false, res);
  }

  // DOWNLOAD COMPRESSED
  @Get(':id/download/compressed')
  async downloadCompressed(@Param('id') id: string, @Res() res: Response) {
    return this.hadithService.downloadFile(id, true, res);
  }
}
