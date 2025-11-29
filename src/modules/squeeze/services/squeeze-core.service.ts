import { Injectable } from '@nestjs/common';
import { SqueezeActionModel } from '../action-models/squeeze.action-model';
import { Squeeze } from '../models/squeeze.model';
import { SqueezeDto } from '../dtos/squeeze.dto';

@Injectable()
export class SqueezeCoreService {
  constructor(private readonly action: SqueezeActionModel) {}

  async create(payload: SqueezeDto) {
    return this.action.createEntry(payload as Partial<Squeeze>);
  }

  async findByEmail(email: string) {
    return this.action.findByEmail(email);
  }
}
