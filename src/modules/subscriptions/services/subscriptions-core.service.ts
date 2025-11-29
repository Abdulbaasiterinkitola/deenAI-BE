import { Injectable } from '@nestjs/common';
import { UserModelAction } from '@modules/users/action-models/user.action-model';
import { PlansService } from '@modules/plans/plans.service';
import { CustomHttpException } from '@shared/custom.exception';
import { HttpStatus } from '@nestjs/common';
import { Plan } from '@modules/plans/models/plan.model';
import { PlanResponseDto } from '@modules/plans/dto/plan-response.dto';

@Injectable()
export class SubscriptionsCoreService {
  constructor(
    private readonly userModelAction: UserModelAction,
    private readonly plansService: PlansService,
  ) {}

  async changePlan(userId: string, planId: string): Promise<PlanResponseDto> {
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


  async getCurrentPlan(userId: string): Promise<PlanResponseDto> {

    const user = await this.userModelAction.get({ id: userId });

    if (!user) {
      throw new CustomHttpException('User not found. ', HttpStatus.NOT_FOUND);
    }

    const planId = user.planId;

    if (!planId) {
      throw new CustomHttpException('User does not have an active plan.', HttpStatus.NOT_FOUND);
    }

    const PlanResponseDto = await this.plansService.getById(planId);

    return PlanResponseDto;

  }




  
}
