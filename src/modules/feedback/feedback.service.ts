import { Injectable } from '@nestjs/common';
import { FeedbackCoreService } from './services/feedback-core.service';
import { FeedbackNameHelperService } from './services/feedback-name-helper.service';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly feedbackCoreService: FeedbackCoreService,
    private readonly feedbackNameHelperService: FeedbackNameHelperService,
  ) {}

  async createFeedback(user: any, title: string, description: string) {
    const name = this.feedbackNameHelperService.extractNameFromUser(user);

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
