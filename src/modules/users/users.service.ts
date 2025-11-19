import { Injectable } from '@nestjs/common';
import UserCoreService from './services/user-core.service';
import { UserType } from './types/user';
import { AuthProvider } from './enums';
import { Repository } from 'typeorm';
import { User } from './models/user.model';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    private readonly userCoreService: UserCoreService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async createUser(user: UserType) {
    return await this.userCoreService.createUser(user);
  }

  async getUserByEmail(email: string) {
    return await this.userCoreService.getUserByEmail(email);
  }
  async getUserById(id: string) {
    return await this.userCoreService.getUserById(id);
  }

  async updateUserPassword(id: string, hashedPassword: string) {
    return await this.userCoreService.updateUserPassword(id, hashedPassword);
  }

  async updateUserAuthProvider(
    email: string,
    authProvider: AuthProvider,
    isEmailVerified: boolean,
  ) {
    return await this.userCoreService.updateUserAuthProvider(
      email,
      authProvider,
      isEmailVerified,
    );
  }
}
