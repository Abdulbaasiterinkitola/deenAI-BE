import { HttpStatus, Injectable } from '@nestjs/common';
import UserCoreService from './services/user-core.service';
import { UserType } from './types/user';
import { AuthProvider } from './enums';
import { Repository } from 'typeorm';
import { User } from './models/user.model';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UserProfileDto } from './dtos/user-profile.dto';

import { NotificationSettingsService } from '@modules/notification-settings/notification-settings.service';
import { CustomHttpException } from '@shared/custom.exception';
import { normalizeEmail } from '@helpers/email.helper';
@Injectable()
export class UsersService {
  constructor(
    private readonly userCoreService: UserCoreService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly notificationSettingsService: NotificationSettingsService,
  ) {}

  async createUser(user: UserType) {
    const email = normalizeEmail(user.email);
    if (!email) {
      throw new CustomHttpException(
        'Email is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const normalizedUser: UserType = { ...user, email };

    await this.userRepo.manager.transaction(async (manager) => {
      const userCreated = await this.userCoreService.createUser(
        normalizedUser,
        manager,
      );
      const userId = userCreated.data?.id;
      if (!userId) {
        throw new CustomHttpException(
          'Failed to retrieve newly created user ID',
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.notificationSettingsService.createUserNotificationSettings(
        userId,
        manager,
      );
    });
  }

  async getUserByEmail(email: string) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      throw new CustomHttpException(
        'Email is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.userCoreService.getUserByEmail(normalizedEmail);
  }
  async getUserById(id: string) {
    return await this.userCoreService.getUserById(id);
  }

  async updateUserPassword(id: string, hashedPassword: string) {
    return await this.userCoreService.updateUserPassword(id, hashedPassword);
  }

  async markEmailAsVerified(email: string) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      throw new CustomHttpException(
        'Email is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.userCoreService.markEmailAsVerified(normalizedEmail);
  }

  async updateUserAuthProvider(
    email: string,
    authProvider: AuthProvider,
    isEmailVerified: boolean,
  ) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      throw new CustomHttpException(
        'Email is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.userCoreService.updateUserAuthProvider(
      normalizedEmail,
      authProvider,
      isEmailVerified,
    );
  }

  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    const currentRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepo.update(userId, {
      currentRefreshToken,
    });
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'email', 'currentRefreshToken'],
    });

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user?.currentRefreshToken || '',
    );

    if (isRefreshTokenMatching) {
      return user;
    }
    return null;
  }

  async removeRefreshToken(userId: string) {
    return this.userRepo.update(userId, {
      currentRefreshToken: null,
    });
  }

  getUserProfile(user: User): UserProfileDto {
    return UserProfileDto.fromEntity(user);
  }
  async requestAccountDeletion(userId: string) {}
}
