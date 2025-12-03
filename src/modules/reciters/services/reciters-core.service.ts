import { Injectable } from '@nestjs/common';
import { ReciterModelAction } from '../reciter.model-action';
import { CreateReciterDto } from '../dtos/create-reciter.dto';
import { Reciter } from '../models/reciter.model';

@Injectable()
export class RecitersCoreService {
  constructor(private reciterModelAction: ReciterModelAction) {}

  async create(
    payload: Partial<CreateReciterDto> & { filePath: string; fileSize: number; duration?: number },
  ): Promise<Reciter> {
    const createPayload: Partial<Reciter> = {
      reciterName: payload.reciterName,
      surah: payload.surah,
      filePath: payload.filePath,
      fileSize: payload.fileSize,
      // Use undefined if duration is not provided so TypeScript type matches Reciter.duration?: number
      duration: typeof payload.duration === 'number' ? payload.duration : undefined,
    };

    return (await this.reciterModelAction.create({
      createPayload,
      transactionOptions: { useTransaction: false },
    })) as Reciter;
  }

  async findById(id: string): Promise<Reciter | null> {
    return this.reciterModelAction.get({ id }, {}, {});
  }
}
