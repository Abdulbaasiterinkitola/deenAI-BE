import { Injectable } from '@nestjs/common';
import { SubscriptionsCoreService } from './services/subscriptions-core.service';
import { SubscriptionsValidationService } from './services/subscriptions-validation.service';
import { PlanChangeResponseDto } from '@modules/users/dtos/plan-change-response.dto';
import { UserModelAction } from '@modules/users/action-models/user.action-model';
import { UserStatus } from '@modules/users/enums/user-status.enum';
import { User } from '@modules/users/models/user.model';
import { Plan } from '@modules/plans/models/plan.model';

export type SubscriptionSnapshot = {
  plan: {
    id: string;
    name: string;
    slug: string;
    features: string[];
  };
  userStatus: UserStatus;
};
import { PlanResponseDto } from '@modules/plans/dto/plan-response.dto';

import { PlansService } from '@modules/plans/plans.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly subscriptionsCoreService: SubscriptionsCoreService,
    private readonly subscriptionsValidationService: SubscriptionsValidationService,
    private readonly userModelAction: UserModelAction,
    private readonly plansService: PlansService,
  ) { }

  async getActiveSubscriptionForUser(
    userId: string,
  ): Promise<SubscriptionSnapshot | null> {
    const user = await this.userModelAction.get({ id: userId }, {}, ['plan']);

    if (!user || !user.plan) {
      return null;
    }

    return {
      plan: {
        id: user.plan.id,
        name: user.plan.name,
        slug: user.plan.slug,
        features: user.plan.features ?? [],
      },
      userStatus: user.status,
    };
  }

  async changePlan(
    userId: string,
    planId: string,
  ): Promise<PlanChangeResponseDto> {
    this.subscriptionsValidationService.validatePlanId(planId);

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

  async getUserByGoogleToken(token: string): Promise<User | null> {
    return await this.userModelAction.get({ googlePurchaseToken: token });
  }

  async getUserByAppleId(transactionId: string): Promise<User | null> {
    return await this.userModelAction.get({ appleOriginalTransactionId: transactionId });
  }

  async getPlanByProductId(provider: 'google' | 'apple', productId: string): Promise<Plan | null> {
    return this.plansService.getPlanByProductId(provider, productId);
  }

  async cancelSubscription(userId: string): Promise<void> {
    await this.userModelAction.update({
      updatePayload: { planId: null },
      identifierOptions: { id: userId },
    });
  }
}
