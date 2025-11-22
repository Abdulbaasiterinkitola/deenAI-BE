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
import { DeletionCodeService } from './services/deletion-code.service';
import { AccountDeletionCode } from './models/account-deletion.model';
import { EmailServiceModule } from '@modules/email/email.module';
import { PlansModule } from '@modules/plans/plans.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PasswordResetOtp, AccountDeletionCode]),
    forwardRef(() => AuthModule),
    forwardRef(() => NotificationSettingsModule),
    EmailServiceModule,
    PlansModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserCoreService,
    UserValidationService,
    UserModelAction,
    DeletionCodeService,
  ],
  exports: [UsersService, UserValidationService],
})
export class UsersModule {}
