import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class MailService {
  constructor(
    @InjectQueue('email') private emailQueue: Queue,
  ) {}

  async sendWelcomeEmail(email: string, name: string) {
    await this.emailQueue.add('welcome-email', {
      email,
      name,
      template: 'welcome',
    });
  }
}