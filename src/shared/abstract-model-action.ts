import { Injectable } from '@nestjs/common';
import {
  Repository,
  DeepPartial,
  FindOptionsWhere,
  QueryDeepPartialEntity,
  EntityManager,
  FindManyOptions,
} from 'typeorm';

export interface CreateRecordGeneric<T> {
  createPayload: T;
  transactionOptions?: {
    useTransaction: boolean;
    transaction?: EntityManager;
  };
}

export interface UpdateRecordGeneric<T, U> {
  updatePayload: T;
  identifierOptions: U;
  transactionOptions?: {
    useTransaction: boolean;
    transaction?: EntityManager;
  };
}

export interface DeleteRecordGeneric<T> {
  identifierOptions: T;
  transactionOptions?: {
    useTransaction: boolean;
    transaction?: EntityManager;
  };
}

export interface PaginationMeta {
  total: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ListRecordGeneric<T> {
  filterRecordOptions?: T;
  paginationPayload?: { limit: number; page: number };
  relations?: Record<string, boolean>;
  order?: Record<string, 'ASC' | 'DESC'>;
}

@Injectable()
export abstract class AbstractModelAction<T> {
  constructor(
    protected readonly repository: Repository<T>,
    protected readonly entity: new () => T,
  ) {}

  async create(
    createRecordOptions: CreateRecordGeneric<DeepPartial<T>>,
  ): Promise<T | null> {
    const { createPayload, transactionOptions } = createRecordOptions;

    if (transactionOptions?.useTransaction && transactionOptions.transaction) {
      return await transactionOptions.transaction.save(
        this.entity,
        createPayload as DeepPartial<T>,
      );
    }

    const entity = this.repository.create(createPayload);
    return await this.repository.save(entity);
  }

  async update(
    updateRecordOptions: UpdateRecordGeneric<
      QueryDeepPartialEntity<T>,
      FindOptionsWhere<T>
    >,
  ): Promise<T | null> {
    const { updatePayload, identifierOptions, transactionOptions } =
      updateRecordOptions;

    if (transactionOptions?.useTransaction && transactionOptions.transaction) {
      await transactionOptions.transaction.update(
        this.entity,
        identifierOptions,
        updatePayload,
      );
      return await transactionOptions.transaction.findOne(
        this.entity,
        { where: identifierOptions } as FindManyOptions<T>,
      );
    }

    await this.repository.update(identifierOptions, updatePayload);
    return await this.repository.findOne({ where: identifierOptions } as FindManyOptions<T>);
  }

  async delete(
    deleteRecordOptions: DeleteRecordGeneric<FindOptionsWhere<T>>,
  ): Promise<void> {
    const { identifierOptions, transactionOptions } = deleteRecordOptions;

    if (transactionOptions?.useTransaction && transactionOptions.transaction) {
      await transactionOptions.transaction.delete(this.entity, identifierOptions);
      return;
    }

    await this.repository.delete(identifierOptions);
  }

  async get(
    getRecordIdentifierOptions: object,
    queryOptions?: object,
    relations?: object,
  ): Promise<T | null> {
    return await this.repository.findOne({
      where: getRecordIdentifierOptions as FindOptionsWhere<T>,
      ...queryOptions,
      relations: relations as Record<string, boolean>,
    } as FindManyOptions<T>);
  }

  async list(
    listRecordOptions: ListRecordGeneric<object>,
  ): Promise<{ payload: T[]; paginationMeta: Partial<PaginationMeta> }> {
    const {
      filterRecordOptions = {},
      paginationPayload,
      relations,
      order,
    } = listRecordOptions;

    const limit = paginationPayload?.limit || 10;
    const page = paginationPayload?.page || 1;
    const skip = (page - 1) * limit;

    const [payload, total] = await this.repository.findAndCount({
      where: filterRecordOptions as FindOptionsWhere<T>,
      relations: relations as Record<string, boolean>,
      order: order as Record<string, 'ASC' | 'DESC'>,
      take: limit,
      skip,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      payload,
      paginationMeta: {
        total,
        limit,
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  async transaction<TResult>(
    runInTransaction: (manager: EntityManager) => Promise<TResult>,
  ): Promise<TResult> {
    return await this.repository.manager.transaction(runInTransaction);
  }

  async exists(where: FindOptionsWhere<T>): Promise<boolean> {
    const count = await this.repository.count({ where });
    return count > 0;
  }

  async count(where: FindOptionsWhere<T>): Promise<number> {
    return await this.repository.count({ where });
  }
}

