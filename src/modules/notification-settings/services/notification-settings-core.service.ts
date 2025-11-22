import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { NotificationSettingsModelAction } from '../model-actions/notification-settings.model-action';
import { NotificationSettingsValidationService } from './notification-settings-validation.service';
import { UpdateNotificationSettingsDto } from '../dtos/update-notification-settings.dto';
import { NotificationSettings } from '../models/notification-setting.model';

@Injectable()
export class NotificationSettingsCoreService {
  constructor(
    private readonly notificationSettingsModelAction: NotificationSettingsModelAction,
    private readonly validationService: NotificationSettingsValidationService,
  ) {}

  async getSettings(userId: string): Promise<NotificationSettings> {
    const result = await this.notificationSettingsModelAction.list({
      filterRecordOptions: { userId },
      paginationPayload: { page: 1, limit: 1 },
    });

    const settings = result.payload?.[0] || null;
    return this.validationService.validateSettingsExists(settings);
  }

  async createUserNotification(userId: string, transaction?: EntityManager) {
    if (!transaction) {
      const result = await this.notificationSettingsModelAction.list({
        filterRecordOptions: { userId },
        paginationPayload: { page: 1, limit: 1 },
      });
      if (result.payload.length > 0) return;
    }

    await this.notificationSettingsModelAction.create({
      createPayload: { userId },
      ...(transaction
        ? {
            transactionOptions: {
              useTransaction: true,
              transaction,
            },
          }
        : {}),
    });
  }

  async updateSettings(
    userId: string,
    dto: UpdateNotificationSettingsDto,
  ): Promise<NotificationSettings> {
    const settings: NotificationSettings = await this.getSettings(userId);

    this.validationService.validateOwnership(settings, userId);

    const updatedSettings = await this.notificationSettingsModelAction.update({
      updatePayload: { ...dto },
      identifierOptions: { id: settings.id },
    });

    if (!updatedSettings)
      throw new Error('Failed to update notification settings');
    return updatedSettings;
  }

  async deleteUserNotification(userId: string, transaction?: EntityManager) {
    const result = await this.notificationSettingsModelAction.list({
      filterRecordOptions: { userId },
      paginationPayload: { page: 1, limit: 1 },
    });
    const settings = result.payload?.[0];

    if (settings) {
      await this.notificationSettingsModelAction.delete({
        identifierOptions: { id: settings.id },
        ...(transaction
          ? {
              transactionOptions: {
                useTransaction: true,
                transaction,
              },
            }
          : {}),
      });
    }
  }
}
