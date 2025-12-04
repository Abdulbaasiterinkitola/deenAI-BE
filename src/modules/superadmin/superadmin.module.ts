import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { SuperadminNotificationsController } from './controllers/superadmin-notifications.controller';
import { SuperadminNotificationsService } from './services/superadmin-notifications.service';
import { SuperadminStatsController } from './controllers/superadmin-stats.controller';
import { SuperadminStatsService } from './services/superadmin-stats.service';
import { NotificationsProcessor } from './processors/notifications.processor';
import { EmailServiceModule } from '../email/email.module';
import { UsersModule } from '../users/users.module';
import { PushNotificationsModule } from '../push-notifications/push-notifications.module';
import { NotificationLog } from '../notification-settings/entities/notification-log.entity';
import { User } from '../users/models/user.model';
import { SuperadminService } from './superadmin.service';
import { SuperAdminUserCrudService } from './services/superadmin-crud.service';
import { SuperadminCrudValidator } from './services/super-admin-crud-validation.service';
import { SuperadminCrudController } from './controllers/superadmin-crud.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationLog, User]),
    BullModule.registerQueue({ name: 'notifications' }),
    EmailServiceModule,
    UsersModule,
    PushNotificationsModule,
  ],
  controllers: [
    SuperadminNotificationsController,
    SuperadminStatsController,
    SuperadminCrudController,
  ],
  providers: [
    SuperadminNotificationsService,
    NotificationsProcessor,
    SuperadminService,
    SuperadminStatsService,
    SuperAdminUserCrudService,
    SuperadminCrudValidator,
  ],
  exports: [SuperadminNotificationsService],
})
export class SuperadminModule {}
