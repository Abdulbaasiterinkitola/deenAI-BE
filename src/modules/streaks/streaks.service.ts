import { forwardRef, Inject, Injectable, HttpStatus } from '@nestjs/common';
import { StreaksCoreService } from './services/streaks-core.service';
import { EntityManager } from 'typeorm';
import { UsersService } from '@modules/users/users.service';
import { TimezoneService } from '@shared/services/timezone.service';
import { CustomHttpException } from '@shared/custom.exception';
import { DateTime } from 'luxon';

@Injectable()
export class StreaksService {
  constructor(
    private readonly streaksCoreService: StreaksCoreService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly timezoneService: TimezoneService,
  ) {}

  async createStreak(userId: string, transaction?: EntityManager) {
    await this.streaksCoreService.createStreak(userId, transaction);
  }

  async updateStreak(userId: string) {
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new CustomHttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const timezone = this.timezoneService.getEffectiveTimezone(user);
    // Use Luxon to ensure we get a UTC date, unaffected by server timezone
    const completedAtUtc = DateTime.utc().toJSDate();

    return await this.streaksCoreService.updateStreak(
      userId,
      completedAtUtc,
      timezone,
    );
  }
}
