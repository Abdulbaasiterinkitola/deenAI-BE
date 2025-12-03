import { Injectable, Logger } from '@nestjs/common';
import { ContactCoreService } from './services/contact-core.service';
import { ContactValidationService } from './services/contact-validation.service';
import { ContactDto } from './dtos/contact.dto';
import { ContactSubmission } from './models/contact-submission.model';
import { EmailService } from '@modules/email/email.service';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly coreService: ContactCoreService,
    private readonly validationService: ContactValidationService,
    private readonly emailService: EmailService,
  ) {}

  async submitContact(payload: ContactDto): Promise<ContactSubmission> {
    const sanitizedPayload = this.validationService.validatePayload(payload);
    const submission =
      await this.coreService.createSubmission(sanitizedPayload);
    this.logger.log(`Contact submission stored for ${submission.email}`);

    // Send emails (fire and forget)
    this.sendContactEmails(submission);

    return submission;
  }

  private sendContactEmails(submission: ContactSubmission): void {
    process.nextTick(() => {
      // Send confirmation to user
      this.emailService
        .sendEmail(
          submission.email,
          'We received your message',
          'contact-confirmation',
          {
            name: submission.name,
            message: submission.content,
          },
        )
        .catch((error) => {
          this.logger.error(
            `Failed to send confirmation email to ${submission.email}: ${error.message}`,
          );
        });

      // Send notification to team
      const supportEmail = process.env.SUPPORT_EMAIL || 'support@deenai.com';
      this.emailService
        .sendEmail(
          supportEmail,
          `New Contact: ${submission.name}`,
          'contact-notification',
          {
            name: submission.name,
            email: submission.email,
            message: submission.content,
          },
        )
        .catch((error) => {
          this.logger.error(
            `Failed to send team notification for ${submission.email}: ${error.message}`,
          );
        });
    });
  }
}
