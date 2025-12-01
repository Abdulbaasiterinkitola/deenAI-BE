import { Injectable } from '@nestjs/common';
import { ReciterModelAction } from '../reciter.model-action';
import { CreateReciterDto } from '../dtos/create-reciter.dto';
import { Reciter } from '../models/reciter.model';

@Injectable()
export class RecitersCoreService {
  constructor(private reciterModelAction: ReciterModelAction) {}

  async create(payload: Partial<CreateReciterDto> & { filePath: string; fileSize: number; duration?: number; }): Promise<Reciter> {
    const createPayload: Partial<Reciter> = {
      reciterName: payload.reciterName,
      surah: payload.surah,
      startAyah: payload.startAyah,
      endAyah: payload.endAyah,
      filePath: payload.filePath,
      fileSize: payload.fileSize,
      duration: payload.duration || null,
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
