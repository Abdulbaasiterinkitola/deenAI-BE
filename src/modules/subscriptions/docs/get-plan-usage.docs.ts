import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PlanWithTokenUsageDto } from '../dtos/plan-with-token-usage.dto';

export class GetPlanUsageDocs {
  static getCurrentPlanWithTokenUsage() {
    return applyDecorators(
      ApiOperation({
        summary: 'Get current plan with token usage',
        description:
          "Fetch the authenticated user's current plan along with token usage statistics including tokens used, remaining tokens, and limit status.",
      }),
      ApiBearerAuth(),
      ApiResponse({
        status: 200,
        description: 'Plan with token usage retrieved successfully',
        type: PlanWithTokenUsageDto,
        schema: {
          example: {
            success: true,
            message: 'Current plan with token usage retrieved successfully',
            data: {
              plan: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'Premium Plan',
                slug: 'premium',
                description: 'Premium subscription plan',
                price: '29.99',
                currency: 'USD',
                interval: 'monthly',
                isPopular: true,
                isCustom: false,
                displayOrder: 2,
                features: ['Feature 1', 'Feature 2'],
                tokenLimit: 100000,
                createdAt: '2025-01-15T10:00:00.000Z',
                updatedAt: '2025-01-15T10:00:00.000Z',
              },
              tokensUsed: 50000,
              tokensLimit: 100000,
              tokensRemaining: 50000,
              tokensUsedPercentage: 50,
              billingCycleStart: '2025-01-15T10:00:00.000Z',
              isLimitReached: false,
              isApproachingLimit: false,
            },
            meta: null,
          },
        },
      }),
      ApiResponse({
        status: 401,
        description: 'Unauthorized - Authentication required',
      }),
      ApiResponse({
        status: 404,
        description: 'User not found or user does not have an active plan',
      }),
    );
  }
}
