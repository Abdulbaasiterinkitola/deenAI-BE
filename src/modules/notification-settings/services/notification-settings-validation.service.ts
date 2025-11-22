import { HttpStatus, Injectable } from '@nestjs/common';
import { NotificationSettings } from '../models/notification-setting.model';
import { CustomHttpException } from '@shared/custom.exception';

@Injectable()
export class NotificationSettingsValidationService {
  /**
   * Ensures settings exist, otherwise throws 404
   */
  validateSettingsExists(
    settings: NotificationSettings | null,
  ): NotificationSettings {
    if (!settings) {
      throw new CustomHttpException(
        'Notification settings not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return settings;
  }

  /**
   * Ensures the logged-in user owns these settings
   */
  validateOwnership(settings: NotificationSettings, userId: string): void {
    if (settings.userId !== userId) {
      throw new CustomHttpException(
        'You are not authorized to update these settings',
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
