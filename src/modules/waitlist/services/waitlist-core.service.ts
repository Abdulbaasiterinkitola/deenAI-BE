import { Injectable } from '@nestjs/common';
import { WaitlistActionModel } from '../action-models/waitlist.action-model';
import { WaitlistDto } from '../dtos/waitlist.dto';

@Injectable()
export class WaitlistCoreService {
  constructor(private readonly action: WaitlistActionModel) {}

  async create(payload: WaitlistDto) {
    return this.action.createEntry(payload);
  }

  async findByEmail(email: string) {
    return this.action.findByEmail(email);
  }
}
