import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { SuperadminNotificationsController } from './controllers/superadmin-notifications.controller';
import { SuperadminNotificationsService } from './services/superadmin-notifications.service';
import { NotificationsProcessor } from './processors/notifications.processor';
import { EmailServiceModule } from '../email/email.module';
import { UsersModule } from '../users/users.module';
import { PushNotificationsModule } from '../push-notifications/push-notifications.module';
import { NotificationLog } from '../notification-settings/entities/notification-log.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { User } from '../users/models/user.model';
import { SuperadminTokenStatsController } from './controllers/superadmin-token-stats.controller';
import { SuperadminTokenStatsService } from './services/superadmin-token-stats.service';
import { TokenUsageActionModel } from '@modules/token-usage/action-models/token-usage.action-model';
import { TokenUsageService } from '@modules/token-usage/token-usage.service';
import { TokenUsage } from '@modules/token-usage/models/token-usage.entity';
import { Plan } from '@modules/plans/models/plan.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationLog, User,Plan,TokenUsage]),
    BullModule.registerQueue({ name: 'notifications' }),
    EmailServiceModule,
    UsersModule,
    PushNotificationsModule,
    CacheModule.register(),
  ],
  controllers: [SuperadminNotificationsController,SuperadminTokenStatsController],
  providers: [SuperadminNotificationsService, NotificationsProcessor,SuperadminTokenStatsService,
    TokenUsageActionModel,
    TokenUsageService],
  exports: [SuperadminNotificationsService],
})
export class SuperadminModule {}
