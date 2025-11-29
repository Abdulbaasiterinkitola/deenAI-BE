import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Squeeze } from '../models/squeeze.model';

@Injectable()
export class SqueezeActionModel {
  constructor(
    @InjectRepository(Squeeze)
    private readonly repo: Repository<Squeeze>,
  ) {}

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  async createEntry(payload: Partial<Squeeze>) {
    const entry = this.repo.create(payload);
    return this.repo.save(entry);
  }
}
