import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@modules/users/models/user.model';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsCoreService } from './services/subscriptions-core.service';
import { SubscriptionsValidationService } from './services/subscriptions-validation.service';
import { UserModelAction } from '@modules/users/action-models/user.action-model';
import { PlansModule } from '@modules/plans/plans.module';
import { SubscriptionsController } from './subscriptions.controller';
import { UsersModule } from '@modules/users/users.module';
import { AuthModule } from '@modules/auth/auth.module';
import { PaymentsModule } from '@modules/payments/payments.module';
import { ActiveSubscriptionGuard } from '@guards/active-subscription.guard';
import { SubscriptionGuard } from '@guards/subscription.guard';
import { TokenUsageModule } from '@modules/token-usage/token-usage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PlansModule,
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
    forwardRef(() => PaymentsModule),
    TokenUsageModule,
  ],
  controllers: [SubscriptionsController],
  providers: [
    SubscriptionsService,
    SubscriptionsCoreService,
    SubscriptionsValidationService,
    UserModelAction,
    ActiveSubscriptionGuard,
    SubscriptionGuard,
  ],
  exports: [SubscriptionsService, ActiveSubscriptionGuard, SubscriptionGuard],
})
export class SubscriptionsModule {}
