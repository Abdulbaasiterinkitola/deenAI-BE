import {
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { ChangePlanDto } from '../dtos/change-plan.dto';
import { PlanChangeResponseDto } from '../dtos/plan-change-response.dto';

export class ChangePlanDocs {
  static changePlan() {
    return applyDecorators(
      ApiBearerAuth(),
      ApiOperation({
        summary: 'Change user subscription plan',
        description:
          'Allows authenticated users to change their subscription plan. ' +
          'Users can upgrade to premium plans or downgrade to the free plan. ' +
          'The plan change is immediate and does not include payment processing.',
      }),
      ApiBody({
        type: ChangePlanDto,
        description: 'Plan change request with target plan ID',
      }),
      ApiResponse({
        status: 200,
        description: 'Plan successfully changed',
        type: PlanChangeResponseDto,
      }),
      ApiResponse({
        status: 400,
        description: 'Bad Request - Invalid plan ID format or missing planId',
        schema: {
          example: {
            success: false,
            message: 'Validation failed',
            errors: [
              {
                field: 'planId',
                message: 'planId must be a UUID',
              },
            ],
            status_code: 400,
          },
        },
      }),
      ApiResponse({
        status: 401,
        description: 'Unauthorized - User must be authenticated',
        schema: {
          example: {
            success: false,
            message: 'Unauthorized',
            status_code: 401,
          },
        },
      }),
      ApiResponse({
        status: 404,
        description: 'Not Found - Plan does not exist',
        schema: {
          example: {
            success: false,
            message: 'Plan not found',
            status_code: 404,
          },
        },
      }),
    );
  }
}
