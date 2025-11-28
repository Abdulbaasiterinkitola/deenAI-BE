import { Injectable } from '@nestjs/common';
import { AbstractModelAction } from '@shared/abstract-model-action';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Streak } from '../models/streak.model';

@Injectable()
export class StreakActionModel extends AbstractModelAction<Streak> {
  constructor(
    @InjectRepository(Streak)
    repository: Repository<Streak>,
  ) {
    super(repository, Streak);
  }

  /**
   * Execute a custom SQL query
   * @param query - SQL query string
   * @param parameters - Optional query parameters
   * @returns Query result
   */
  async customQuery(query: string, parameters?: any[]): Promise<any> {
    return this.repository.query(query, parameters);
  }
}
