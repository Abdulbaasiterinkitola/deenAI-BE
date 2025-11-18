import { Injectable } from '@nestjs/common';
import { AbstractModelAction } from '@shared/abstract-model-action';
import { User } from '../models/user.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserModelAction extends AbstractModelAction<User> {
  constructor(
    @InjectRepository(User)
    repository: Repository<User>,
  ) {
    super(repository, User);
  }

  async getById(id: string) {
    return await this.get({ id });
  }

  async updatePassword(id: string, password: string) {
    return await this.update({
      updatePayload: { password },
      identifierOptions: { id },
    });
  }
}
