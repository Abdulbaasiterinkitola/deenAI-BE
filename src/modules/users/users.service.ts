import { Injectable } from '@nestjs/common';
import UserCoreService from './services/user-core.service';
import { UserType } from './types/user';

@Injectable()
export class UsersService {
  constructor(private readonly userCoreService: UserCoreService) {}

  async createUser(user: UserType) {
    return await this.userCoreService.createUser(user);
  }
}
