import { Injectable } from '@nestjs/common';
import { WaitlistActionModel } from '../action-models/waitlist.action-model';
import { Waitlist } from '../models/waitlist.model';

@Injectable()
export class WaitlistCoreService {
  constructor(private readonly action: WaitlistActionModel) {}

  async create(payload) {
    return this.action.createEntry(payload as Partial<Waitlist>);
  }

  async findByEmail(email: string) {
    return this.action.findByEmail(email);
  }
}
