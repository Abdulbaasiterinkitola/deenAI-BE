import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import UserCoreService from './user-core.service';
import UserValidationService from './user-validation.service';

@Injectable()
export class UserSessionService {
  constructor(
    private readonly userCoreService: UserCoreService,
    private readonly userValidationService: UserValidationService,
  ) {}

  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    const currentRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userCoreService.updateCurrentRefreshToken(
      userId,
      currentRefreshToken,
    );
  }

  async removeRefreshToken(userId: string) {
    await this.userCoreService.updateCurrentRefreshToken(userId, null);
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    const user = await this.userCoreService.getUserWithRefreshToken(userId);
    return await this.userValidationService.validateRefreshTokenMatch(
      refreshToken,
      user,
    );
  }
}
