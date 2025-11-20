import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NotificationSettingsService } from './notification-settings.service';
import { NotificationSettingsController } from './notification-settings.controller';
import { UsersModule } from '@modules/users/users.module';
import { NotificationSettingsCoreService } from './services/notification-settings-core.service';
import { NotificationSettings } from './models/notification-setting.model';
import { NotificationSettingsModelAction } from './model-actions/notification-settings.model-action';

const daysToSeconds = (days: number) => days * 24 * 60 * 60;

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationSettings]),
    forwardRef(() => UsersModule),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.get<string>('JWT_SECRET') || 'fallbackSecret',
        signOptions: {
          expiresIn: daysToSeconds(3), // 3 days in seconds
        },
      }),
    }),
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
