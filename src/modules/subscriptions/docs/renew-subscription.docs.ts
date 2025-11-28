import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export class RenewSubscriptionDocs {
  static renewSubscription() {
    return applyDecorators(
      ApiBearerAuth(),
      ApiOperation({
        summary: 'Simulate a monthly subscription renewal',
      }),
      ApiResponse({
        status: 200,
        description: 'Subscription renewed successfully (billingStart reset)',
      }),
    );
  }
}
