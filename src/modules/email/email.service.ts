import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class EmailService {
  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  async sendEmail(
    email: string,
    subject: string,
    template: string, // This is the template name, e.g., 'waitlist'
    context?: Record<string, any>, // Optional context for the template
  ) {
    await this.emailQueue.add('email', {
      email,
      subject,
      template,
      context,
    });
  }
}
