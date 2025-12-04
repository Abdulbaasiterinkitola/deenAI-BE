import { Injectable } from '@nestjs/common';
import { UserModelAction } from '@modules/users/action-models/user.action-model';
import { PlansService } from '@modules/plans/plans.service';
import { CustomHttpException } from '@shared/custom.exception';
import { HttpStatus } from '@nestjs/common';
import { Plan } from '@modules/plans/models/plan.model';
import { PlanResponseDto } from '@modules/plans/dto/plan-response.dto';
import { SubscriptionCacheService } from '@shared/services/subscription-cache.service';

@Injectable()
export class SubscriptionsCoreService {
  constructor(
    private readonly userModelAction: UserModelAction,
    private readonly plansService: PlansService,
    private readonly subscriptionCacheService: SubscriptionCacheService,
  ) {}

  async changePlan(userId: string, planId: string): Promise<PlanResponseDto> {
    const planDto = await this.plansService.getById(planId);

    const plan: Plan = {
      id: planDto.id,
      name: planDto.name,
      slug: planDto.slug,
    } as Plan;

    // Update user's planId using model action
    // Also update the billingStart to the current date to start the new billing cycle when a user upgrades
    const updateResult = await this.userModelAction.update({
      updatePayload: {
        planId,
        billingStart: new Date(),
      },
      identifierOptions: { id: userId },
    });

    if (!updateResult) {
      const user = await this.userModelAction.get({ id: userId });
      if (!user) {
        throw new CustomHttpException(
          'User not found, plan not updated',
          HttpStatus.NOT_FOUND,
        );
      }
    }

    // Invalidate subscription cache after plan change
    await this.subscriptionCacheService.del(userId);

    return plan;
  }

  async getCurrentPlan(userId: string): Promise<PlanResponseDto> {
    const user = await this.userModelAction.get({ id: userId });

    if (!user) {
      throw new CustomHttpException('User not found. ', HttpStatus.NOT_FOUND);
    }

    const planId = user.planId;

    if (!planId) {
      throw new CustomHttpException(
        'User does not have an active plan.',
        HttpStatus.NOT_FOUND,
      );
    }

    // This will use the plans cache internally
    return await this.plansService.getById(planId);
  }

  // Premium user subscription renewal
  async renewSubscription(userId: string): Promise<void> {
    const user = await this.userModelAction.get({ id: userId }, ['plan']);
    if (!user) {
      throw new CustomHttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.plan?.slug === 'free') {
      throw new CustomHttpException(
        'Cannot renew a free subscription',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.userModelAction.update({
      updatePayload: {
        billingStart: new Date(),
      },
      identifierOptions: { id: userId },
    });

    // Invalidate subscription cache after renewal
    await this.subscriptionCacheService.del(userId);
  }
}
