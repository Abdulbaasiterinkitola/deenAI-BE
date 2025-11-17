import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class EmailService {
  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  async sendEmail(
    email: string,
    name: string,
    subject: string,
    template: string,
  ) {
    await this.emailQueue.add('email', {
      email,
      name,
      subject,
      template,
    });
  }
}
 