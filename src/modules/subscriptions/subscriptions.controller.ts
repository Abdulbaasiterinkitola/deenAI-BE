import { AuthUser } from '@guards/auth-user.decorator';
import { AuthGuard } from '@guards/auth.guard';
import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { User } from '@modules/users/models/user.model';
import { ApiTags } from '@nestjs/swagger';
import { RenewSubscriptionDocs } from './docs/renew-subscription.docs';
import { SubscriptionsCoreService } from './services/subscriptions-core.service';

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(AuthGuard)
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsCoreService: SubscriptionsCoreService,
    private readonly subscriptionsService: SubscriptionsService,
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

  @Get('current-plan')
  async getCurrentPlan(@AuthUser() user: User) {
    const plan = await this.subscriptionsService.getCurrentPlan(user.id);

    return {
      success: true,
      data: plan,
      message: 'Current plan retrieved successfully',
      meta: null,
    };
  }
}
