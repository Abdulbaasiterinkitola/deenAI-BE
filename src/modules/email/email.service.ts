import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ProcessMail } from './email.processor';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @InjectQueue('email') private emailQueue: Queue,
    private processMail: ProcessMail,
  ) {}

  async sendEmail(
    email: string,
    subject: string,
    template: string,
    context: Record<string, any>,
  ): Promise<void> {
    try {
      // Try queue first with minimal timeout
      if (this.emailQueue) {
        await this.emailQueue.add(
          'email',
          {
            email,
            subject,
            template,
            context,
          },
          {
            attempts: 2,
            backoff: {
              type: 'fixed',
              delay: 1000,
            },
          },
        );
        this.logger.log(`Email queued successfully for ${email}`);
        return;
      }
    } catch (error) {
      this.logger.warn(`Queue failed for ${email}, using direct send: ${(error as Error).message}`);
    }

    // Direct fallback
    try {
      await this.processMail.sendEmailDirectly({
        email,
        subject,
        template,
        ...context,
      });
      this.logger.log(`Email sent directly to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}: ${(error as Error).message}`);
      throw error;
    }
  }
}
