import { Injectable } from '@nestjs/common';
import { SqueezeActionModel } from '../action-models/squeeze.action-model';
import { Squeeze } from '../models/squeeze.model';

@Injectable()
export class SqueezeCoreService {
  constructor(private readonly action: SqueezeActionModel) {}

  async create(payload) {
    return this.action.createEntry(payload as Partial<Squeeze>);
  }

  async findByEmail(email: string) {
    return this.action.findByEmail(email);
  }
}
