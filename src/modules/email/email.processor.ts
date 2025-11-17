import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
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

  // Inject ConfigService
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
      this.configService.get<string>('MAIL_USERNAME');
    const pass =
      this.configService.get<string>('SMTP_PASS') ||
      this.configService.get<string>('MAIL_PASSWORD');
    const mailFromName = this.configService.get<string>('MAIL_FROM_NAME');
    const mailFromAddress = this.configService.get<string>('MAIL_FROM_ADDRESS');

    const from =
      this.configService.get<string>('SMTP_FROM') ||
      (mailFromName && mailFromAddress
        ? `${mailFromName} <${mailFromAddress}>`
        : mailFromAddress) ||
      'DeenAI <no-reply@deenai.com>';

    this.defaultFrom = from;

    if (!host) {
      throw new Error(
        'Missing SMTP_HOST (or MAIL_HOST) environment variable for email transport.',
      );
    }
    const transportOptions: SMTPTransport.Options = {
      host,
      port,
      secure: false, // True for 465, false for other ports
      auth: {
        user,
        pass,
      },
    };
    const nodemailerModule = nodemailer as unknown as {
      createTransport(options: SMTPTransport.Options): MailTransporter;
    };

    //initialize nodemailer transport
    console.log(transportOptions);
    this.transport = nodemailerModule.createTransport(transportOptions);
  }

  // template loader
  // Loads the template file and replaces variables with provided values
  // templateName: The name of the template file (without extension)
  // variables: An object containing key-value pairs to replace in the template
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
  // Sends a welcome email to the user for waitlist
  // job: The Bull job containing email, name, and subject
  @Process('email')
  async sendEmail(job: Job): Promise<void> {
    const { subject, email, template, context } = job.data as {
      subject: string;
      email: string;
      template: string;
      context: Record<string, string>;
    };

    try {
      // Pass the entire context object to the template loader
      const htmlContent = this.loadTemplate(template, context);
      await this.transport.sendMail({
        from: this.defaultFrom,
        to: email,
        subject,
        html: htmlContent,
      });
      this.logger.log(`Email sent to ${email} via SMTP`);
    } catch (error) {
      this.logger.error(
        `SMTP failed for ${email}: ${(error as Error).message}`,
      );
      throw error;
    }
  }
}
