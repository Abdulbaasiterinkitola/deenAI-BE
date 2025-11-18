import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export interface EmailJobData {
  email: string;
  name: string;
  subject: string;
  template: string;
  variables?: Record<string, string>;
}

@Injectable()
export class EmailService {
  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  async sendEmail(
    email: string,
    name: string,
    subject: string,
    template: string,
    variables: Record<string, string> = {},
  ) {
    await this.emailQueue.add('email', {
      email,
      name,
      subject,
      template,
      variables,
    } as EmailJobData); // <-- cast instead of using type argument
  }
}
