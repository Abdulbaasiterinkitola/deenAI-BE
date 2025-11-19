import { HttpStatus, Injectable } from '@nestjs/common';
import { NotificationSettingsModelAction } from '../model-actions/notification-settings.model-action';
import UserValidationService from '@modules/users/services/user-validation.service';
import { CustomHttpException } from '@shared/custom.exception';
import { EntityManager } from 'typeorm';

@Injectable()
export class NotificationSettingsCoreService {
  constructor(
    private readonly notificationSettingsModelAction: NotificationSettingsModelAction,
    private readonly userValidationService: UserValidationService,
  ) {}

  async createUserNotification(userId: string, transaction?: EntityManager) {
    await this.userValidationService.validateUserExists(userId, transaction);
    const notificationSettingsCreated =
      await this.notificationSettingsModelAction.create({
        createPayload: {
          userId,
        },
        ...(transaction
          ? {
              transactionOptions: {
                useTransaction: true,
                transaction,
              },
            }
          : {}),
      });
    if (!notificationSettingsCreated) {
      throw new CustomHttpException(
        'Failed to create notification settings',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
