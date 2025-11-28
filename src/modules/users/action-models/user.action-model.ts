import { Injectable } from '@nestjs/common';
import { AbstractModelAction } from '@shared/abstract-model-action';
import { User } from '../models/user.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, FindOneOptions } from 'typeorm';

@Injectable()
export class UserModelAction extends AbstractModelAction<User> {
  constructor(
    @InjectRepository(User)
    repository: Repository<User>,
  ) {
    super(repository, User);
  }

  async get(identifierOptions: FindOptionsWhere<User>): Promise<User | null> {
    const selectFields: (keyof User)[] = [
      'id',
      'createdAt',
      'updatedAt',

      'email',
      'name',
      'password',
      'authProvider',
      'isEmailVerified',
      'planId',
      'billingStart',
    ];

    return await this.repository.findOne({
      where: identifierOptions,
      select: selectFields, // <-- This forces TypeORM to load the data
    } as FindOneOptions<User>);
  }

  async getById(id: string) {
    return await this.get({ id });
  }

  async getWithPlanById(id: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['plan'],
    } as FindOneOptions<User>);
  }

  async updatePassword(id: string, password: string) {
    return await this.update({
      updatePayload: { password },
      identifierOptions: { id },
    });
  }
}
