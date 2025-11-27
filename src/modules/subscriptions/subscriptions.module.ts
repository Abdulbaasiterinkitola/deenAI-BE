import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@modules/users/models/user.model';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsCoreService } from './services/subscriptions-core.service';
import { SubscriptionsValidationService } from './services/subscriptions-validation.service';
import { UserModelAction } from '@modules/users/action-models/user.action-model';
import { PlansModule } from '@modules/plans/plans.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), PlansModule],
  providers: [
    SubscriptionsService,
    SubscriptionsCoreService,
    SubscriptionsValidationService,
    UserModelAction,
  ],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
