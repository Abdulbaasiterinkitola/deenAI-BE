import { Injectable } from '@nestjs/common';
import { NotificationSettingsCoreService } from './services/notification-settings-core.service';
import { EntityManager } from 'typeorm';
import { UpdateNotificationSettingsDto } from './dtos/update-notification-settings.dto';

@Injectable()
export class NotificationSettingsService {
  constructor(
    private readonly notificationSettingsCoreService: NotificationSettingsCoreService,
  ) {}

  /** * Create default settings for a user
   */
  async createUserNotificationSettings(
    userId: string,
    transaction?: EntityManager,
  ) {
    await this.notificationSettingsCoreService.createUserNotification(
      userId,
      transaction,
    );
  }

  /**
   * Update settings for a user
   */
  async updateUserNotificationSettings(
    userId: string,
    dto: UpdateNotificationSettingsDto,
  ) {
    return this.notificationSettingsCoreService.updateSettings(userId, dto);
  }

  /**
   * Delete settings within a transaction
   * (Called by UsersModule)
   */
  async deleteUserNotificationSettingsWithTransaction(
    userId: string,
    transaction: EntityManager,
  ) {
    await this.notificationSettingsCoreService.deleteUserNotification(
      userId,
      transaction,
    );
  }
}
