import { Injectable } from '@nestjs/common';
import { SubscriptionsCoreService } from './services/subscriptions-core.service';
import { SubscriptionsValidationService } from './services/subscriptions-validation.service';
import { PlanChangeResponseDto } from '@modules/users/dtos/plan-change-response.dto';
import { UserModelAction } from '@modules/users/action-models/user.action-model';
import { UserStatus } from '@modules/users/enums/user-status.enum';
import { PlanResponseDto } from '@modules/plans/dto/plan-response.dto';
import { SubscriptionCacheService } from '@shared/services/subscription-cache.service';

export type SubscriptionSnapshot = {
  plan: {
    id: string;
    name: string;
    slug: string;
    features: string[];
  };
  userStatus: UserStatus;
};

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly subscriptionsCoreService: SubscriptionsCoreService,
    private readonly subscriptionsValidationService: SubscriptionsValidationService,
    private readonly userModelAction: UserModelAction,
    private readonly subscriptionCacheService: SubscriptionCacheService,
  ) {}

  async getActiveSubscriptionForUser(
    userId: string,
  ): Promise<SubscriptionSnapshot | null> {
    // Try cache first
    const cached =
      await this.subscriptionCacheService.get<SubscriptionSnapshot>(userId);
    if (cached) {
      return cached;
    }

    // Fallback to DB
    const user = await this.userModelAction.get({ id: userId }, {}, ['plan']);

    if (!user || !user.plan) {
      return null;
    }

    const snapshot: SubscriptionSnapshot = {
      plan: {
        id: user.plan.id,
        name: user.plan.name,
        slug: user.plan.slug,
        features: user.plan.features ?? [],
      },
      userStatus: user.status,
    };

    // Cache the result
    await this.subscriptionCacheService.set(userId, snapshot);

    return snapshot;
  }

  async changePlan(
    userId: string,
    planId: string,
  ): Promise<PlanChangeResponseDto> {
    this.subscriptionsValidationService.validatePlanId(planId);

    // changePlan in core service already handles cache invalidation
    const plan = await this.subscriptionsCoreService.changePlan(userId, planId);

    return {
      success: true,
      message: 'Plan changed successfully',
      newPlan: {
        id: plan.id,
        name: plan.name,
        slug: plan.slug,
      },
    };
  }

  async getCurrentPlan(userId: string): Promise<PlanResponseDto> {
    return await this.subscriptionsCoreService.getCurrentPlan(userId);
  }
}
