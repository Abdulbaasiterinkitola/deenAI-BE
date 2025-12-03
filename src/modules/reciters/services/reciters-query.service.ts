import { Injectable } from '@nestjs/common';
import { ReciterModelAction } from '../reciter.model-action';
import { ReciterFilterDto } from '../dtos/reciter-filter.dto';

@Injectable()
export class RecitersQueryService {
  constructor(private reciterModelAction: ReciterModelAction) {}

  async list(filter: ReciterFilterDto) {
    const where: any = {};
    if (filter.reciterName) where.reciterName = filter.reciterName;
    if (filter.surah) where.surah = filter.surah;
    if (filter.surahNumber) where.surahNumber = filter.surahNumber;

    const page = filter.page || 1;
    const limit = filter.limit || 10;

    return this.reciterModelAction.list({
      filterRecordOptions: where,
      paginationPayload: { page, limit },
      order: { createdAt: 'DESC' },
    });
  }
}
