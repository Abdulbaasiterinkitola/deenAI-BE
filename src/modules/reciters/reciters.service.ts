import { Injectable } from '@nestjs/common';
import { RecitersCoreService } from './services/reciters-core.service';
import { RecitersQueryService } from './services/reciters-query.service';
import { CreateReciterDto } from './dtos/create-reciter.dto';

@Injectable()
export class RecitersService {
  constructor(
    private core: RecitersCoreService,
    private queryService: RecitersQueryService,
  ) {}

  createReciter(payload: Partial<CreateReciterDto> & { filePath: string; fileSize: number; duration?: number }) {
    return this.core.create(payload);
  }

  getById(id: string) {
    return this.core.findById(id);
  }

  list(filter: any) {
    return this.queryService.list(filter);
  }
}
