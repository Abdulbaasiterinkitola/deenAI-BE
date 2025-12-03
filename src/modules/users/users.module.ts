import { Module, forwardRef } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
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
import { SubscriptionsModule } from '@modules/subscriptions/subscriptions.module';
import { UserSessionService } from './services/user-session.service';
import { UserAccountDeletionService } from './services/user-account-deletion.service';
import { StreaksModule } from '@modules/streaks/streaks.module';
import { ProfileModule } from '@modules/profile/profile.module';
import { UserRegistrationService } from './services/user-registration.service';
import { SubscriptionCacheService } from '@shared/services/subscription-cache.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PasswordResetOtp, AccountDeletionCode]),
    CacheModule.register(),
    forwardRef(() => AuthModule),
    forwardRef(() => NotificationSettingsModule),
    EmailServiceModule,
    PlansModule,
    SubscriptionsModule,
    forwardRef(() => StreaksModule),
    forwardRef(() => ProfileModule),
    forwardRef(() => SubscriptionsModule),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserCoreService,
    UserValidationService,
    UserModelAction,
    DeletionCodeService,
    UserRegistrationService,
    UserSessionService,
    UserAccountDeletionService,
    SubscriptionCacheService,
  ],
  exports: [UsersService, UserValidationService, SubscriptionCacheService],
})
export class UsersModule {}
