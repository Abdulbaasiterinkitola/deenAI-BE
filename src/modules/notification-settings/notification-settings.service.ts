import { Injectable } from '@nestjs/common';
import { NotificationSettingsCoreService } from './services/notification-settings-core.service';
import { EntityManager } from 'typeorm';
import { NotificationSettings } from './models/notification-setting.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationSettingsService {
  constructor(
    private readonly notificationSettingsCoreService: NotificationSettingsCoreService,
    @InjectRepository(NotificationSettings)
    private readonly notificationSettingsRepo: Repository<NotificationSettings>,
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

  async deleteUserNotificationSettings(userId: string) {
    await this.notificationSettingsRepo.delete({ userId });
  }

  async deleteUserNotificationSettingsWithTransaction(
    userId: string,
    transactionalEntityManager: EntityManager,
  ) {
    await transactionalEntityManager.delete(NotificationSettings, { userId });
  }

  async findByUserId(userId: string): Promise<NotificationSettings | null> {
    return this.notificationSettingsRepo.findOne({ where: { userId } });
  }
}
