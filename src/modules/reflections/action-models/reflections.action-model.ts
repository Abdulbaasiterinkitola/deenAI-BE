import { Injectable } from '@nestjs/common';
import { AbstractModelAction } from '@shared/abstract-model-action';
import { Reflection } from '../models/reflection.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ReflectionsActionModel extends AbstractModelAction<Reflection> {
  constructor(
    @InjectRepository(Reflection)
    repository: Repository<Reflection>,
  ) {
    super(repository, Reflection);
  }

  /**
   * Find a reflection by its ID and user ID
   * @param id - The reflection ID
   * @param userId - The user ID
   * @returns The reflection if found, null otherwise
   */
  async findByIdAndUserId(id: string, userId: string): Promise<Reflection | null> {
    return await this.get({ id, userId });
  }

  /**
   * Find all reflections for a specific user
   * @param userId - The user ID
   * @param options - Pagination and filtering options
   * @returns Paginated list of reflections
   */
  async findByUserId(
    userId: string,
    options?: {
      paginationPayload?: { limit: number; page: number };
      order?: { createdAt: 'ASC' | 'DESC' };
    },
  ) {
    return await this.list({
      filterRecordOptions: { userId },
      paginationPayload: options?.paginationPayload,
      order: options?.order || { createdAt: 'DESC' },
    });
  }
}