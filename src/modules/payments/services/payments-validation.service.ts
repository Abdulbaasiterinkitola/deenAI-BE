import { Injectable, HttpStatus } from '@nestjs/common';
import { CustomHttpException } from '@shared/custom.exception';
import { PlansService } from '@modules/plans/plans.service';
import { UsersService } from '@modules/users/users.service';

@Injectable()
export class PaymentsValidationService {
  constructor(
    private readonly plansService: PlansService,
    private readonly usersService: UsersService,
  ) {}

  async validateUserExists(userId: string) {
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new CustomHttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async validatePlanExists(planIdOrSlug: string) {
    // Try to find by ID first, then slug
    let plan = await this.plansService.getPlanById(planIdOrSlug);
    
    if (!plan) {
      // If not UUID or not found by ID, try slug mapping logic in CoreService
      // This validator primarily checks if the plan DB entry exists
      return null; 
    }
    return plan;
  }

  /**
   * Basic format validation for tokens/receipts
   */
  validatePurchaseToken(token: string) {
    if (!token || token.length < 10) {
      throw new CustomHttpException(
        'Invalid purchase token format',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}