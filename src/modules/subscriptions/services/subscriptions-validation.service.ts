import { Injectable } from '@nestjs/common';
import { CustomHttpException } from '@shared/custom.exception';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class SubscriptionsValidationService {
  validatePlanId(planId: string): void {
    if (!planId || planId.trim() === '') {
      throw new CustomHttpException(
        'Plan ID is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    // UUID v4 validation regex
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(planId)) {
      throw new CustomHttpException(
        'Invalid plan ID format',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
