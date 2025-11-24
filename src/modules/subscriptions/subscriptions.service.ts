import { Injectable } from '@nestjs/common';
import { SubscriptionsCoreService } from './services/subscriptions-core.service';
import { SubscriptionsValidationService } from './services/subscriptions-validation.service';
import { PlanChangeResponseDto } from '@modules/users/dtos/plan-change-response.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly subscriptionsCoreService: SubscriptionsCoreService,
    private readonly subscriptionsValidationService: SubscriptionsValidationService,
  ) {}

  async changePlan(
    userId: string,
    planId: string,
  ): Promise<PlanChangeResponseDto> {
    // Validate input
    this.subscriptionsValidationService.validatePlanId(planId);

    // Change plan using core service
    const plan = await this.subscriptionsCoreService.changePlan(userId, planId);

    // Return response
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
}
