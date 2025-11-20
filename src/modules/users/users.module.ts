import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import UserCoreService from './services/user-core.service';
import UserValidationService from './services/user-validation.service';
import { UserModelAction } from './action-models/user.action-model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './models/user.model';
import { PasswordResetOtp } from '@modules/auth/models/otp.model';
import { AuthModule } from '@modules/auth/auth.module';
import { NotificationSettingsModule } from '@modules/notification-settings/notification-settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PasswordResetOtp]),
    forwardRef(() => AuthModule),
    forwardRef(() => NotificationSettingsModule),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserCoreService,
    UserValidationService,
    UserModelAction,
  ],
  exports: [UsersService, UserValidationService],
})
export class UsersModule {}
