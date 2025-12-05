import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FEATURE_KEY } from '../common/decorators/feature.decorator';
import { SubscriptionsService } from '@modules/subscriptions/subscriptions.service';
import { PaymentStatusService } from '@modules/payments/services/payment-status.service';
import { CustomHttpException } from '@shared/custom.exception';
import { UserStatus } from '@modules/users/enums/user-status.enum';

interface RequestUser {
  id: string;
  status?: UserStatus;
  plan?: {
    features?: string[];
    slug?: string;
  };
}

const SUBSCRIPTION_GRACE_PERIOD_DAYS = 3;

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly subscriptionService: SubscriptionsService,
    private readonly paymentStatusService: PaymentStatusService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.getAllAndOverride<string>(
      FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredFeature) return true;

    const req = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    const user = req.user;

    if (!user?.id) {
      throw new CustomHttpException(
        'User not authenticated.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (user.status && user.status !== UserStatus.ACTIVE) {
      throw new CustomHttpException(
        'Your account is not active.',
        HttpStatus.FORBIDDEN,
      );
    }

    const subscription =
      await this.subscriptionService.getActiveSubscriptionForUser(user.id);

    if (!subscription?.plan) {
      throw new CustomHttpException(
        'No active subscription found.',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    const planFeatures =
      user.plan?.features ?? subscription.plan.features ?? [];

    if (!planFeatures.includes(requiredFeature)) {
      throw new CustomHttpException(
        `Your plan does not allow access to this feature: ${requiredFeature}`,
        HttpStatus.FORBIDDEN,
      );
    }

    const paymentStatus = await this.paymentStatusService.getPaymentStatus(
      user.id,
      SUBSCRIPTION_GRACE_PERIOD_DAYS,
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
