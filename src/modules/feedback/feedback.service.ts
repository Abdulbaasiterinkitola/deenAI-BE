import { Injectable } from '@nestjs/common';
import { FeedbackCoreService } from './services/feedback-core.service';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly feedbackCoreService: FeedbackCoreService,
  ) {}

  async createFeedback(
    name: string,
    title: string,
    description: string,
  ) {
    const feedback = await this.feedbackCoreService.createFeedback(
      name,
      title,
      description,
    );

    return {
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback,
    };
  }
}
