/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable prettier/prettier */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FEATURE_KEY } from '../decorators/feature.decorator';
import { SubscriptionsService } from '@modules/subscriptions/subscriptions.service';

export type SubscriptionType = {
  plan: {
    plan_key: string;
    features: string[];
    limits: Record<string, any>;
  };
  status: string;
};

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private subscriptionService: SubscriptionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.get<string>(
      FEATURE_KEY,
      context.getHandler(),
    );

    if (!requiredFeature) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user) throw new ForbiddenException('User not authenticated');

    // Narrow subscription type
    let subscription: SubscriptionType | null = null;

    if (user.subscription && user.subscription.plan) {
      subscription = user.subscription as SubscriptionType;
    } else {
      const sub = await this.subscriptionService.getActiveSubscriptionForUser(
        user.id,
      );

      if (!sub || !sub.plan) {
        throw new ForbiddenException('No active subscription');
      }

      subscription = {
        plan: {
          plan_key: sub.plan.plan_key,
          features: sub.plan.features,
          limits: sub.plan.limits,
        },
        status: sub.status,
      };
    }

    // ✅ subscription is now fully defined
    if (!subscription.plan.features.includes(requiredFeature)) {
      throw new ForbiddenException(
        `Your plan does not allow access to this feature: ${requiredFeature}`,
      );
    }

    return true;
  }
}
