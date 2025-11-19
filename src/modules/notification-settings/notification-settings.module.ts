import { Module, forwardRef } from '@nestjs/common';
import { NotificationSettingsService } from './notification-settings.service';
import { NotificationSettingsController } from './notification-settings.controller';
import { UsersModule } from '@modules/users/users.module';
import { NotificationSettingsCoreService } from './services/notification-settings-core.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationSettings } from './models/notification-setting.model';
import { NotificationSettingsModelAction } from './model-actions/notification-settings.model-action';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationSettings]),
    forwardRef(() => UsersModule),
  ],
  controllers: [NotificationSettingsController],
  providers: [
    NotificationSettingsService,
    NotificationSettingsCoreService,
    NotificationSettingsModelAction,
  ],
  exports: [NotificationSettingsService],
})
export class NotificationSettingsModule {}
