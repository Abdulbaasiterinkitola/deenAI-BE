import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@Processor('email')
export class MailProcessor {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  private loadTemplate(
    templateName: string,
    variables: Record<string, string>,
  ): string {
    const templatePath = path.join(
      __dirname,
      'templates',
      `${templateName}.html`,
    );
    let template = fs.readFileSync(templatePath, 'utf8');

    // Replace variables in template
    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(regex, variables[key]);
    });

    return template;
  }

  @Process('welcome-email')
  async handleWelcomeEmail(job: Job) {
    const { email, name } = job.data as { email: string; name: string };

    const htmlContent = this.loadTemplate('welcome', { name });

    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: email,
      subject: 'Welcome to Deen AI - Your Spiritual Journey Begins',
      html: htmlContent,
    };

    await this.transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
  }
}
