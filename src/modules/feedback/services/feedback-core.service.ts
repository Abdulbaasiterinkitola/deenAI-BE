import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { CustomHttpException } from '@shared/custom.exception';
import * as nodemailer from 'nodemailer';
import { FeedbackActionModel } from '../action-models/feedback.action-model';

@Injectable()
export class FeedbackCoreService {
  private readonly logger = new Logger(FeedbackCoreService.name);

  constructor(private readonly feedbackActionModel: FeedbackActionModel) {}

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
    // guard: if no PM configured, skip silently
    const pmEmail = process.env.PM_EMAIL;
    if (!pmEmail) {
      this.logger.warn('PM_EMAIL not configured - skipping feedback email');
      return;
    }

    // guard: ensure SMTP config present
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT) {
      this.logger.warn('SMTP config missing - skipping feedback email');
      return;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for 587/other
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Dev-only: allow self-signed certs if needed (do NOT enable in production)
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production',
      },
      greetingTimeout: 30_000,
      socketTimeout: 30_000,
    });

    try {
      // Verify connection early to get a clearer error than "Unexpected socket close"
      await transporter.verify();
      this.logger.debug('SMTP connection verified');
    } catch (verifyErr) {
      this.logger.error('SMTP verify failed', verifyErr as any);
      // Don't throw here — email is best-effort, just log and return
      return;
    }

    try {
      await transporter.sendMail({
        from: `"DeenAI Feedback" <${process.env.SMTP_USER ?? 'no-reply@example.com'}>`,
        to: pmEmail,
        subject: `New Feedback: ${title}`,
        html: `
          <h3>New Feedback Received</h3>
          <p><b>Name:</b> ${name}</p>
          <p><b>Title:</b> ${title}</p>
          <p><b>Description:</b><br/>${description}</p>
        `,
      });
      this.logger.debug(`Feedback email sent to ${pmEmail}`);
    } catch (err) {
      // bubble error up to caller only as a rejected Promise (caller already handles logging)
      throw err;
    }
  }
}
