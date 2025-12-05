import { Injectable } from '@nestjs/common';
import { AbstractModelAction } from '@shared/abstract-model-action';
import { User } from '../models/user.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { UserStatus } from '../enums/user-status.enum';

@Injectable()
export class UserModelAction extends AbstractModelAction<User> {
  constructor(
    @InjectRepository(User)
    repository: Repository<User>,
  ) {
    super(repository, User);
  }

  async getTotalCount(): Promise<number> {
    return await this.repository.count();
  }

  async getCountByStatus(status: UserStatus): Promise<number> {
    return await this.repository.count({ where: { status } });
  }

  async getCountByCreatedAtRange(since: Date): Promise<number> {
    return await this.repository.count({
      where: {
        createdAt: MoreThanOrEqual(since),
      },
    });
  }
}
