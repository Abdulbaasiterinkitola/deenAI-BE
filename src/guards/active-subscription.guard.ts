import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionsService } from '@modules/subscriptions/subscriptions.service';
import { PaymentStatusService } from '@modules/payments/services/payment-status.service';
import { CustomHttpException } from '@shared/custom.exception';
import {
  RequireActiveSubscriptionOptions,
  REQUIRE_ACTIVE_SUBSCRIPTION_KEY,
} from './require-active-subscription.decorator';
import { User } from '@modules/users/models/user.model';
import { UserStatus } from '@modules/users/enums/user-status.enum';

const DEFAULT_GRACE_PERIOD_DAYS = 3;

@Injectable()
export class ActiveSubscriptionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly paymentStatusService: PaymentStatusService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options =
      this.reflector.getAllAndOverride<RequireActiveSubscriptionOptions>(
        REQUIRE_ACTIVE_SUBSCRIPTION_KEY,
        [context.getHandler(), context.getClass()],
      ) ?? {};

    const request = context.switchToHttp().getRequest<{ user?: User }>();
    const user = request.user;

    if (!user) {
      throw new CustomHttpException(
        'Authentication is required to access this resource.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new CustomHttpException(
        'Your account must be active to access this resource.',
        HttpStatus.FORBIDDEN,
      );
    }

    const subscription =
      await this.subscriptionsService.getActiveSubscriptionForUser(user.id);

    if (!subscription?.plan) {
      throw new CustomHttpException(
        'No active subscription found.',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    if (subscription.plan.slug === 'free') {
      throw new CustomHttpException(
        'A paid plan is required to access this feature.',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    const gracePeriod =
      options.gracePeriodInDays ?? DEFAULT_GRACE_PERIOD_DAYS ?? 0;

    const paymentStatus = await this.paymentStatusService.getPaymentStatus(
      user.id,
      gracePeriod,
    );

    if (paymentStatus.state !== 'active') {
      throw new CustomHttpException(
        paymentStatus.reason ?? 'Subscription is not active.',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    return true;
  }
}
