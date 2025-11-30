import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

/**
 * DOC: Subscribe endpoint
 */
export function SubscribeDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Subscribe to newsletter',
      description:
        'Subscribe to DeenAI newsletter. Works for both authenticated and unauthenticated users.',
    }),
    ApiResponse({
      status: 200,
      description: 'Successfully subscribed to newsletter',
      schema: {
        example: {
          success: true,
          message:
            'Successfully subscribed to newsletter! Check your email for confirmation.',
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'User not found',
      schema: {
        example: {
          success: false,
          message: 'User not found. Please register first.',
          status_code: 404,
        },
      },
    }),
  );
}

/**
 * DOC: Unsubscribe endpoint
 */
export function UnsubscribeDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Unsubscribe from newsletter',
      description:
        'Unsubscribe from DeenAI newsletter and receive feedback request.',
    }),
    ApiResponse({
      status: 200,
      description: 'Successfully unsubscribed',
      schema: {
        example: {
          success: true,
          message:
            "Successfully unsubscribed from newsletter. We'd love to hear your feedback!",
        },
      },
    }),
  );
}

/**
 * DOC: Check Status endpoint
 */
export function CheckStatusDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Check subscription status',
      description: 'Check if authenticated user is subscribed to newsletter',
    }),
    ApiResponse({
      status: 200,
      description: 'Status retrieved',
      schema: {
        example: {
          success: true,
          isSubscribed: true,
        },
      },
    }),
  );
}

/**
 * DOC: Get Stats endpoint (Admin)
 */
export function StatsDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get subscription statistics (Admin)',
      description: 'Get newsletter subscription statistics',
    }),
    ApiResponse({
      status: 200,
      description: 'Statistics retrieved',
      schema: {
        example: {
          success: true,
          data: {
            total: 1000,
            subscribed: 850,
            unsubscribed: 150,
          },
        },
      },
    }),
  );
}
