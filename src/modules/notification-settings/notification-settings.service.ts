import { Injectable } from '@nestjs/common';
import { NotificationSettingsCoreService } from './services/notification-settings-core.service';
import { EntityManager } from 'typeorm';

@Injectable()
export class NotificationSettingsService {
  constructor(
    private readonly notificationSettingsCoreService: NotificationSettingsCoreService,
  ) {}

  async createUserNotificationSettings(
    userId: string,
    transaction?: EntityManager,
  ) {
    await this.notificationSettingsCoreService.createUserNotification(
      userId,
      transaction,
    );
  }
}
