import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PushNotificationService } from './push-notification.service';
import { DeviceToken } from './entities/device-token.entity';
import { User } from '../users/models/user.model';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceToken, User])],
  providers: [PushNotificationService],
  exports: [PushNotificationService],
})
export class PushNotificationsModule {}
