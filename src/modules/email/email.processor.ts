import { Processor, Process } from '@nestjs/bull';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { render } from '@react-email/render';
import React from 'react';
import WaitlistEmail from './templates/waitlist-email';
import WelcomeEmail from './templates/welcome-email';
import OtpEmail from './templates/otp-email';
import PasswordResetSuccessEmail from './templates/password-reset-success';
import VerificationCodeEmail from './templates/verification-code';
import AccountDeletionCompleteEmail from './templates/account-deletion-complete';
import AccountDeletionRequestEmail from './templates/deletion-otp';
import { Job } from 'bull';

type MailTransporter = {
  sendMail(
    mailOptions: SMTPTransport.MailOptions,
  ): Promise<SMTPTransport.SentMessageInfo>;
};

// Template mapping: maps template names to HNG SDK email components
type TemplateProps = {
  [key: string]: any;
};

type EmailTemplate =
  | React.FC<TemplateProps>
  | ((props: TemplateProps) => React.ReactElement);

const TEMPLATE_MAP: Record<string, EmailTemplate> = {
  waitlist: WaitlistEmail,
  welcome: WelcomeEmail,
  'forgot-password': OtpEmail,
  'password-reset-success': PasswordResetSuccessEmail,
  'email-verification': VerificationCodeEmail,
  'account-deletion': AccountDeletionRequestEmail,
  'account-deletion-complete': AccountDeletionCompleteEmail,
};

@Processor('email')
export class ProcessMail {
  private readonly logger = new Logger(ProcessMail.name);
  private readonly transport: MailTransporter;
  private readonly defaultFrom: string;

  constructor(private configService: ConfigService) {
    this.logger.log(
      'ProcessMail processor initialized and ready to process email jobs',
    );
    this.logger.log('Processor is listening for jobs on queue: email');

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
      secure: false, // True for 465, false for other ports
      auth: { user, pass },
    };

    const nodemailerModule = nodemailer as unknown as {
      createTransport(options: SMTPTransport.Options): MailTransporter;
    };

    this.transport = nodemailerModule.createTransport(transportOptions);
  }

  // Renders HNG SDK email template to HTML
  private async renderHngTemplate(
    templateName: string,
    variables: Record<string, any>,
  ): Promise<string> {
    try {
      this.logger.debug(`Rendering template: ${templateName}`);
      const EmailComponent = TEMPLATE_MAP[templateName];

      if (!EmailComponent) {
        throw new Error(
          `Template "${templateName}" not found. Available templates: ${Object.keys(
            TEMPLATE_MAP,
          ).join(', ')}`,
        );
      }

      // Pass all variables directly to the component
      const props: TemplateProps = { ...variables };

      this.logger.debug(
        `Creating React element with props: ${JSON.stringify(props)}`,
      );

      const reactElement = React.createElement(EmailComponent, props);
      const htmlContent = await render(reactElement);

      this.logger.debug(
        `Template rendered successfully, HTML length: ${htmlContent.length}`,
      );
      return htmlContent;
    } catch (error) {
      this.logger.error(
        `Failed to render template "${templateName}": ${(error as Error).message}`,
      );
      this.logger.error(`Stack trace: ${(error as Error).stack}`);
      throw error;
    }
  }

  // Sends an email using the Bull queue
  @Process('email')
  async sendEmail(job: Job): Promise<void> {
    this.logger.log(`[QUEUE PROCESSOR] Processing email job: ${job.id}`);
    this.logger.log(`[QUEUE PROCESSOR] Job data: ${JSON.stringify(job.data)}`);

    const { subject, email, context, template } = job.data as {
      subject: string;
      email: string;
      template: string;
      context: Record<string, any>;
    };

    this.logger.log(
      `[QUEUE PROCESSOR] Email job data - email: ${email}, template: ${template}, subject: ${subject}`,
    );

    try {
      // Spread all context variables including OTP
      this.logger.log(`Starting template rendering for ${email}...`);
      const htmlContent = await this.renderHngTemplate(template, {
        ...context,
      });
      this.logger.log(`Template rendered successfully for ${email}`);

      this.logger.log(`Sending email to ${email} via SMTP...`);
      await this.transport.sendMail({
        from: this.defaultFrom,
        to: email,
        subject,
        html: htmlContent,
      });
      this.logger.log(
        `Email sent successfully to ${email} via SMTP using template: ${template}`,
      );

      // Remove job from Redis after successful completion
      try {
        await job.remove();
        this.logger.log(`Job ${job.id} removed from Redis queue`);
      } catch (removeError) {
        this.logger.warn(
          `Failed to remove job ${job.id} from queue: ${(removeError as Error).message}`,
        );
        // Don't throw here - email was sent successfully
      }
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${email}: ${(error as Error).message}`,
      );
      this.logger.error(`Error stack: ${(error as Error).stack}`);
      throw error;
    }
  }

  // Direct send method (bypasses queue)
  // Change the sendEmailDirectly method signature
  async sendEmailDirectly(data: {
    email: string;
    subject: string;
    template: string;
    [key: string]: any; // This allows any additional properties
  }): Promise<void> {
    const { subject, email, template, ...rest } = data;

    this.logger.log(
      `Sending email directly - email: ${email}, template: ${template}, subject: ${subject}`,
    );

    try {
      this.logger.log(`Starting template rendering for ${email}...`);
      // Spread all variables including OTP, name, etc.
      const htmlContent = await this.renderHngTemplate(template, { ...rest });
      this.logger.log(`Template rendered successfully for ${email}`);

      this.logger.log(`Sending email to ${email} via SMTP...`);
      await this.transport.sendMail({
        from: this.defaultFrom,
        to: email,
        subject,
        html: htmlContent,
      });
      this.logger.log(
        `Email sent successfully to ${email} via SMTP using template: ${template}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send email directly to ${email}: ${(error as Error).message}`,
      );
      this.logger.error(`Error stack: ${(error as Error).stack}`);
      throw error;
    }
  }
}
