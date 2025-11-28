import { Injectable } from '@nestjs/common';
import { UserModelAction } from '@modules/users/action-models/user.action-model';
import { PlansService } from '@modules/plans/plans.service';
import { CustomHttpException } from '@shared/custom.exception';
import { HttpStatus } from '@nestjs/common';
import { Plan } from '@modules/plans/models/plan.model';

@Injectable()
export class SubscriptionsCoreService {
  constructor(
    private readonly userModelAction: UserModelAction,
    private readonly plansService: PlansService,
  ) {}

  async changePlan(userId: string, planId: string): Promise<Plan> {
    // Validate plan exists using PlansService
    const planDto = await this.plansService.getById(planId);

    // Convert DTO back to entity (we need the Plan entity)
    const plan: Plan = {
      id: planDto.id,
      name: planDto.name,
      slug: planDto.slug,
    } as Plan;

    // Update user's planId using model action
    const updateResult = await this.userModelAction.update({
      updatePayload: { planId },
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

    return plan;
  }
}
