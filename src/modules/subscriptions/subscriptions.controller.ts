import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { SubscriptionsCoreService } from './services/subscriptions-core.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@guards/auth-user.decorator';
import { RenewSubscriptionDocs } from './docs/renew-subscription.docs';
import { User } from '@modules/users/models/user.model';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsCoreService: SubscriptionsCoreService,
  ) {}

  @Post('renew-subscription/:userId')
  @HttpCode(HttpStatus.OK)
  @RenewSubscriptionDocs.renewSubscription()
  async simulateRenewal(@AuthUser() user: User) {
    await this.subscriptionsCoreService.renewSubscription(user.id);
    return {
      success: true,
      message: 'Subscription renewed successfully',
    };
  }
}
