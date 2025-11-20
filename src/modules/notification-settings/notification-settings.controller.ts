import { Controller } from '@nestjs/common';
import { NotificationSettingsService } from './notification-settings.service';

@Controller('notification-settings')
export class NotificationSettingsController {
  constructor(
    private readonly notificationSettingsService: NotificationSettingsService,
  ) {}
}
