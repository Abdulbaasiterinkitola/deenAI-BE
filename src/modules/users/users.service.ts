import { Injectable, NotFoundException } from '@nestjs/common';
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
  async updateUserPassword(email: string, newPassword: string): Promise<void> {
    const user = await this.getUserByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    // If you want, you can hash here again, but ideally pass hashedPassword from service
    user.password = newPassword;
    await this.userRepo.save(user);
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
