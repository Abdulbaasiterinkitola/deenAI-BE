import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Waitlist } from '../models/waitlist.model';

@Injectable()
export class WaitlistActionModel {
  constructor(
    @InjectRepository(Waitlist)
    private readonly repo: Repository<Waitlist>,
  ) {}

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  async createEntry(payload: Partial<Waitlist>) {
    const entry = this.repo.create(payload);
    return this.repo.save(entry);
  }
}
