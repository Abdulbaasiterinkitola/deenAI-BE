import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { CreateFeedbackDto } from '../dtos/create-feedback.dto';

export class FeedbackDocs {
  static createFeedback() {
    return applyDecorators(
      ApiOperation({
        summary: 'Send feedback',
        description:
          'Allows both authenticated and unauthenticated users to send feedback.',
      }),
      ApiBearerAuth(), // shows Authorization header option in Swagger
      ApiBody({
        type: CreateFeedbackDto,
      }),
      ApiResponse({
        status: 201,
        description: 'Feedback successfully submitted',
        schema: {
          example: {
            success: true,
            message: 'Feedback submitted successfully',
            data: {
              id: 'uuid',
              name: 'Ibrahim Maryam',
              title: 'App feedback',
              description: 'I love the app...',
              createdAt: '2025-01-01T00:00:00.000Z',
            },
          },
        },
      }),
      ApiResponse({
        status: 400,
        description: 'Validation failed',
      }),
      ApiResponse({
        status: 500,
        description: 'Internal server error',
      }),
    );
  }
}
