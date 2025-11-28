import { HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { CustomHttpException } from '@shared/custom.exception';
import { UserType } from '../types/user';
import UserValidationService from './user-validation.service';
import UserCoreService from './user-core.service';
import { NotificationSettingsService } from '@modules/notification-settings/notification-settings.service';
import { PlansService } from '@modules/plans/plans.service';
import { StreaksService } from '@modules/streaks/streaks.service';
import { ProfileService } from '@modules/profile/profile.service';

@Injectable()
export class UserRegistrationService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly userValidationService: UserValidationService,
    private readonly userCoreService: UserCoreService,
    private readonly notificationSettingsService: NotificationSettingsService,
    private readonly plansService: PlansService,
    private readonly streaksService: StreaksService,
    @Inject(forwardRef(() => ProfileService))
    private readonly profileService: ProfileService,
  ) {}

  async createUser(userPayload: UserType) {
    const email = this.userValidationService.normalizeAndValidateEmail(
      userPayload.email,
    );
    const normalizedUser: UserType = { ...userPayload, email };
    const freePlan = await this.plansService.getBySlug('free');

    await this.dataSource.transaction(async (manager) => {
      const savedUser = await this.createUserRecord(normalizedUser, manager);

      await this.notificationSettingsService.createUserNotificationSettings(
        savedUser.id,
        manager,
      );

      await this.streaksService.createStreak(savedUser.id, manager);

      if (freePlan?.id) {
        await this.userCoreService.updateUserPlan(
          savedUser.id,
          freePlan.id,
          manager,
        );
      }
      const generatedUsername = this.generateUsername(
        savedUser.name,
        savedUser.id,
      );

      await this.profileService.createProfile(
        savedUser.id,
        {
          username: generatedUsername,
        },
        manager,
      );
    });
  }

  private async createUserRecord(
    normalizedUser: UserType,
    manager: EntityManager,
  ) {
    const { data: savedUser } = await this.userCoreService.createUser(
      normalizedUser,
      manager,
    );

    if (!savedUser?.id) {
      throw new CustomHttpException(
        'Failed to create user',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return savedUser;
  }

  private generateUsername(name: string, userId: string) {
    const base = name?.replace(/\s+/g, '').toLowerCase() || 'user';
    const suffix = userId.replace(/-/g, '').slice(-6);
    return `${base}_${suffix}`;
  }
}
