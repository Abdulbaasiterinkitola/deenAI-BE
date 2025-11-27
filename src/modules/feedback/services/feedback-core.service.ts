import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { CustomHttpException } from '@shared/custom.exception';
import { FeedbackActionModel } from '../action-models/feedback.action-model';
import { EmailService } from '@modules/email/email.service';

@Injectable()
export class FeedbackCoreService {
  private readonly logger = new Logger(FeedbackCoreService.name);

  constructor(
    private readonly feedbackActionModel: FeedbackActionModel,
    private readonly emailService: EmailService,
  ) {}

  async createFeedback(name: string, title: string, description: string) {
    try {
      const feedback = await this.feedbackActionModel.create({
        createPayload: {
          name,
          title,
          description,
        },
      });

      if (!feedback) {
        throw new CustomHttpException(
          'Failed to save feedback',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Try to notify PM but do not fail the whole request if email fails
      this.sendEmailToPM(name, title, description).catch((err) => {
        this.logger.error('Failed to send feedback email to PM', err as any);
      });

      return feedback;
    } catch (error) {
      this.logger.error('Error creating feedback', error as any);

      if (error instanceof CustomHttpException) {
        throw error;
      }

      throw new CustomHttpException(
        'Something went wrong while submitting feedback',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async sendEmailToPM(
    name: string,
    title: string,
    description: string,
  ): Promise<void> {
    const pmEmail = process.env.PM_EMAIL;
    if (!pmEmail) {
      this.logger.warn('PM_EMAIL not configured - skipping email');
      return;
    }

    try {
      await this.emailService.sendEmail(
        pmEmail,
        `New Feedback: ${title}`,
        'feedback',
        {
          name,
          title,
          description,
        },
      );

      this.logger.debug(`Feedback email queued for ${pmEmail}`);
    } catch (error) {
      this.logger.error('Failed to queue feedback email', error);
    }
  }
}
