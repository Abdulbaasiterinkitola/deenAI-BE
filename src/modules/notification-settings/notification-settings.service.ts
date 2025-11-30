import { Injectable, Inject, Logger } from '@nestjs/common';
import { NotificationSettingsCoreService } from './services/notification-settings-core.service';
import { EntityManager } from 'typeorm';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotificationSettings } from './models/notification-setting.model';
import { UpdateNotificationSettingsDto } from './dtos/update-notification-settings.dto';

@Injectable()
export class NotificationSettingsService {
  private readonly logger = new Logger(NotificationSettingsService.name);
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly notificationSettingsCoreService: NotificationSettingsCoreService,
  ) {}

  private readonly SETTINGS_CACHE_TTL_MS = 15 * 60 * 1000;
  private readonly SETTINGS_CACHE_KEY_PREFIX = 'notification_settings';

  private getSettingsCacheKey(userId: string): string {
    return this.SETTINGS_CACHE_KEY_PREFIX + ':' + userId;
  }

  async getNotificationSettings(
    userId: string,
  ): Promise<NotificationSettings | null> {
    const cacheKey = this.getSettingsCacheKey(userId);
    const cachedSettings =
      await this.cacheManager.get<NotificationSettings>(cacheKey);

    if (cachedSettings) {
      this.logger.log(
        `Cache hit for notification settings for user: ${userId}`,
      );
      return Object.assign(new NotificationSettings(), cachedSettings);
    }

    this.logger.log(`Cache miss for notification settings for user: ${userId}`);
    const settings =
      await this.notificationSettingsCoreService.getSettings(userId);

    if (settings) {
      // Cache the settings for 15 minutes
      await this.cacheManager.set(
        cacheKey,
        settings,
        this.SETTINGS_CACHE_TTL_MS,
      );
    }

    return settings;
  }

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

  async updateNotificationSettings(
    userId: string,
    updateDto: UpdateNotificationSettingsDto,
  ): Promise<NotificationSettings> {
    const updatedSettings =
      await this.notificationSettingsCoreService.updateSettings(
        userId,
        updateDto,
      );

    // Invalidate the cache on update
    await this.cacheManager.del(this.getSettingsCacheKey(userId));

    return updatedSettings;
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
