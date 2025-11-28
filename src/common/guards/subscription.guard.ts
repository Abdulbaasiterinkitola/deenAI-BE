import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FEATURE_KEY } from '../decorators/feature.decorator';
import { SubscriptionsService } from '@modules/subscriptions/subscriptions.service';

type RequestUser = {
  id: string;
  plan?: {
    features?: unknown;
  };
};

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly subscriptionService: SubscriptionsService,
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
      throw new ForbiddenException('User not authenticated');
    }

    const requestFeatures = Array.isArray(user.plan?.features)
      ? (user.plan.features as string[])
      : undefined;

    if (requestFeatures?.includes(requiredFeature)) {
      return true;
    }

    const subscription =
      await this.subscriptionService.getActiveSubscriptionForUser(user.id);

    if (!subscription?.plan) {
      throw new ForbiddenException('No active subscription');
    }

    if (!subscription.plan.features.includes(requiredFeature)) {
      throw new ForbiddenException(
        `Your plan does not allow access to this feature: ${requiredFeature}`,
      );
    }

    return true;
  }
}
