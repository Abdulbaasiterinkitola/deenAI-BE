import { Injectable } from '@nestjs/common';
import { SubscriptionsCoreService } from './services/subscriptions-core.service';
import { SubscriptionsValidationService } from './services/subscriptions-validation.service';
import { PlanChangeResponseDto } from '@modules/users/dtos/plan-change-response.dto';
import { UserModelAction } from '@modules/users/action-models/user.action-model';
import { UserStatus } from '@modules/users/enums/user-status.enum';
import { PlanResponseDto } from '@modules/plans/dto/plan-response.dto';
import { SubscriptionCacheService } from '@shared/services/subscription-cache.service';
import { TokenUsageService } from '@modules/token-usage/token-usage.service';
import { PlanWithTokenUsageDto } from './dtos/plan-with-token-usage.dto';
import { CustomHttpException } from '@shared/custom.exception';
import { HttpStatus } from '@nestjs/common';

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
    private readonly tokenUsageService: TokenUsageService,
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

  async getCurrentPlanWithTokenUsage(
    userId: string,
  ): Promise<PlanWithTokenUsageDto> {
    // Get user to check billing cycle
    const user = await this.userModelAction.get({ id: userId });

    if (!user) {
      throw new CustomHttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Get current plan
    const plan = await this.subscriptionsCoreService.getCurrentPlan(userId);

    // Determine billing cycle start date
    let billingStart = user.billingStart;

    if (!billingStart) {
      // For free users, default to account creation
      // For premium users, this should not happen, but we'll handle it gracefully
      billingStart = user.createdAt;
    }

    // Calculate tokens used in the current billing period
    const tokensUsed = await this.tokenUsageService.calculateMonthlyUsage(
      userId,
      billingStart,
    );

    const tokensLimit = plan.tokenLimit;
    const tokensRemaining = Math.max(0, tokensLimit - tokensUsed);
    const tokensUsedPercentage =
      tokensLimit > 0 ? Math.round((tokensUsed / tokensLimit) * 100) : 0;
    const isLimitReached = tokensUsed >= tokensLimit;
    const isApproachingLimit = tokensUsedPercentage >= 80;

    return {
      plan,
      tokensUsed,
      tokensLimit,
      tokensRemaining,
      tokensUsedPercentage,
      billingCycleStart: billingStart,
      isLimitReached,
      isApproachingLimit,
    };
  }
}
