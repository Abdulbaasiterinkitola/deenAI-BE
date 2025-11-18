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
    name: string,
    subject: string,
    template: string,
  ): Promise<void> {
    if (this.emailQueue) {
      const timeout = 3000; // 3s timeout

      try {
        const isReady = await Promise.race([
          new Promise<boolean>((resolve) => {
            this.emailQueue
              .getJobCounts()
              .then(() => resolve(true))
              .catch(() => resolve(false));
          }),
          new Promise<boolean>((resolve) => {
            setTimeout(() => resolve(false), 1000);
          }),
        ]);

        if (!isReady) {
          this.logger.warn(
            `Queue not ready for ${email}. Falling back to direct send.`,
          );
        } else {
          const queuePromise = this.emailQueue.add(
            'email',
            {
              email,
              name,
              subject,
              template,
            },
            {
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 2000,
              },
            },
          );

          const timeoutPromise = new Promise<void>((_, reject) => {
            setTimeout(() => {
              reject(
                new Error(`Queue add operation timed out after ${timeout}ms`),
              );
            }, timeout);
          });

          try {
            await Promise.race([queuePromise, timeoutPromise]);
            this.logger.debug(`Email job queued successfully for ${email}`);
            return; // Successfully queued, exit early
          } catch (error) {
            this.logger.warn(
              `Failed to queue email for ${email}: ${(error as Error).message}. Falling back to direct send.`,
            );
          }
        }
      } catch (error) {
        this.logger.warn(
          `Queue check failed for ${email}: ${(error as Error).message}. Falling back to direct send.`,
        );
        // Fall through to direct send fallback
      }
    }

    // Fallback: Send email directly if queue is unavailable
    if (this.processMail) {
      this.logger.log(`Sending email directly (bypassing queue) for ${email}`);
      try {
        // Call the processor's sendEmail method directly
        await this.processMail.sendEmailDirectly({
          email,
          name,
          subject,
          template,
        });
        this.logger.log(`Email sent directly to ${email}`);
      } catch (error) {
        this.logger.error(
          `Failed to send email directly to ${email}: ${(error as Error).message}`,
        );
        // Don't throw - we've tried both methods
      }
    } else {
      this.logger.error(
        `Cannot send email to ${email}: Both queue and direct send are unavailable`,
      );
    }
  }
}
