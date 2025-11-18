import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { render } from '@react-email/render';
import { WaitlistEmail } from './templates/waitlist-email';
import React from 'react';

type MailTransporter = {
  sendMail(
    mailOptions: SMTPTransport.MailOptions,
  ): Promise<SMTPTransport.SentMessageInfo>;
};

// Template mapping: maps template names to HNG SDK email components
type TemplateProps = {
  username?: string;
  [key: string]: any;
};

type EmailTemplate =
  | React.FC<TemplateProps>
  | ((props: TemplateProps) => React.ReactElement);

const TEMPLATE_MAP: Record<string, EmailTemplate> = {
  waitlist: WaitlistEmail, // Use custom DeenAI design
  welcome: WaitlistEmail, // Use custom DeenAI design for welcome emails too
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

  // Renders HNG SDK email template to HTML
  // templateName: The name of the template (e.g., 'waitlist', 'welcome')
  // variables: An object containing props to pass to the React email component
  private async renderHngTemplate(
    templateName: string,
    variables: Record<string, any>,
  ): Promise<string> {
    try {
      this.logger.debug(`Rendering template: ${templateName}`);
      const EmailComponent = TEMPLATE_MAP[templateName];

      if (!EmailComponent) {
        throw new Error(
          `Template "${templateName}" not found. Available templates: ${Object.keys(TEMPLATE_MAP).join(', ')}`,
        );
      }

      // Map common variable names to component props
      // For WelcomeEmail, map 'name' to 'username'
      const props: TemplateProps = {
        username: variables.name || variables.username,
        ...variables,
      };

      this.logger.debug(
        `Creating React element with props: ${JSON.stringify(props)}`,
      );

      // Render React component to HTML
      // Use the SDK's intended pattern: call component directly, then render
      // This matches the SDK's example: render(WelcomeEmail({ username: 'John' }))
      this.logger.debug('Calling render function...');
      const reactElement = EmailComponent(props) as React.ReactElement;
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
  // Sends an email using HNG SDK email templates
  // job: The Bull job containing email, name, subject, and template name
  @Process('email')
  async sendEmail(job: Job): Promise<void> {
    this.logger.log(
      `[QUEUE PROCESSOR] ===== Processing email job: ${job.id} =====`,
    );
    this.logger.log(`[QUEUE PROCESSOR] Job data: ${JSON.stringify(job.data)}`);

    const { subject, email, name, template } = job.data as {
      subject: string;
      email: string;
      name: string;
      template: string;
    };

    this.logger.log(
      `[QUEUE PROCESSOR] Email job data - email: ${email}, name: ${name}, template: ${template}, subject: ${subject}`,
    );

    try {
      // Render HNG SDK email template to HTML
      this.logger.log(`Starting template rendering for ${email}...`);
      const htmlContent = await this.renderHngTemplate(template, { name });
      this.logger.log(`Template rendered successfully for ${email}`);

      this.logger.log(`Sending email to ${email} via SMTP...`);
      await this.transport.sendMail({
        from: this.defaultFrom,
        to: email,
        subject,
        html: htmlContent,
      });
      this.logger.log(
        `Email sent successfully to ${email} via SMTP using HNG SDK template: ${template}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${email}: ${(error as Error).message}`,
      );
      this.logger.error(`Error stack: ${(error as Error).stack}`);
      throw error;
    }
  }

  // Direct send method (bypasses queue) - used as fallback when queue is unavailable
  async sendEmailDirectly(data: {
    email: string;
    name: string;
    subject: string;
    template: string;
  }): Promise<void> {
    const { subject, email, name, template } = data;

    this.logger.log(
      `Sending email directly (bypassing queue) - email: ${email}, name: ${name}, template: ${template}, subject: ${subject}`,
    );

    try {
      // Render HNG SDK email template to HTML
      this.logger.log(`Starting template rendering for ${email}...`);
      const htmlContent = await this.renderHngTemplate(template, { name });
      this.logger.log(`Template rendered successfully for ${email}`);

      this.logger.log(`Sending email to ${email} via SMTP...`);
      await this.transport.sendMail({
        from: this.defaultFrom,
        to: email,
        subject,
        html: htmlContent,
      });
      this.logger.log(
        `Email sent successfully to ${email} via SMTP using HNG SDK template: ${template}`,
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
