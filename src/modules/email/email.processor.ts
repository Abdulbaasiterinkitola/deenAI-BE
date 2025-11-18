import { Processor, Process } from '@nestjs/bull';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { render } from '@react-email/render';
import { WelcomeEmail } from '@hng-sdk/email';

type MailTransporter = {
  sendMail(
    mailOptions: SMTPTransport.MailOptions,
  ): Promise<SMTPTransport.SentMessageInfo>;
};


@Processor('email')
export class ProcessMail {
  private readonly logger = new Logger(ProcessMail.name);
  private readonly transport: MailTransporter;
  private readonly defaultFrom: string;

  constructor(private configService: ConfigService) {
    const host =
      this.configService.get<string>('SMTP_HOST') ||
      this.configService.get<string>('MAIL_HOST');
    const port =
      this.configService.get<number>('SMTP_PORT') ||
      this.configService.get<number>('MAIL_PORT') ||
      587;
    const user =
      this.configService.get<string>('SMTP_USER') ||
      this.configService.get<string>('MAIL_USER');
    const pass =
      this.configService.get<string>('SMTP_PASS') ||
      this.configService.get<string>('MAIL_PASS');
    const mailFromName =
      this.configService.get<string>('MAIL_NAME') || 'DeenAI';
    const mailFromAddress =
      this.configService.get<string>('MAIL_FROM') || 'no-reply@deenai.com';

    this.defaultFrom = `${mailFromName} <${mailFromAddress}>`;

    if (!host) {
      throw new Error(
        'Missing SMTP_HOST (or MAIL_HOST) environment variable for email transport.',
      );
    }

    const transportOptions: SMTPTransport.Options = {
      host,
      port,
      secure: false, // true for 465
      auth: { user, pass },
    };

    const nodemailerModule = nodemailer as unknown as {
      createTransport(options: SMTPTransport.Options): MailTransporter;
    };
    this.transport = nodemailerModule.createTransport(transportOptions);
  }

  /**
   * Load HTML template and replace variables.
   */
  private loadTemplate(
    templateName: string,
    variables: Record<string, string> = {},
  ): string {
    const templatePath = path.join(
      __dirname,
      'templates',
      `${templateName}.html`,
    );
    let template = fs.readFileSync(templatePath, 'utf8');

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(regex, value);
    });

    return template;
  }

  /**
   * Process Bull job to send email
   */
  @Process('email')
  async sendEmail(
    email: string,
    name: string,
    subject: string,
    template: string,
    variables: Record<string, string> = {},
  ): Promise<void> {
    try {
      // HNG SDK compliance rendering for welcome emails
      if (template === 'welcome-email') {
        await render(WelcomeEmail({ username: name }));
      }

      // Merge `name` with other variables for template rendering
      const htmlContent = this.loadTemplate(template, { name, ...variables });

      await this.transport.sendMail({
        from: this.defaultFrom,
        to: email,
        subject,
        html: htmlContent,
      });

      this.logger.log(
        `Email sent successfully to ${email} using template "${template}"`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${email}: ${(error as Error).message}`,
      );
      throw error;
    }
  }
}
