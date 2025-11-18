import { Injectable, Logger } from '@nestjs/common';
import { WaitlistCoreService } from './services/waitlist-core.service';
import { WaitlistValidationService } from './services/waitlist-validation.service';
import { EmailService } from '@modules/email/email.service';
import { Waitlist } from './models/waitlist.model';

@Injectable()
export class WaitlistService {
  private readonly logger = new Logger(WaitlistService.name);

  constructor(
    private readonly core: WaitlistCoreService,
    private readonly validation: WaitlistValidationService,
    private readonly emailService: EmailService,
  ) {}

  async register(payload) {
    const existing = await this.core.findByEmail(payload.email as string);
    this.validation.validateDuplicate(existing);
    const entry = await this.core.create(payload);
    this.queueWelcomeEmail(entry); // Don't await - fire and forget

    this.logger.log(`Registration complete for: ${payload.email}`);
    return entry;
  }

  private queueWelcomeEmail(entry: Waitlist) {
    const fallbackName = entry.email?.split('@')[0] ?? 'friend';
    const name = entry.name ?? fallbackName;

    process.nextTick(() => {
      this.emailService
        .sendEmail(entry.email, 'Welcome to the DeenAI waitlist', 'waitlist', {
          name,
        })
        .catch((error) => {
          this.logger.error(
            `Failed to queue waitlist email for ${entry.email}: ${
              (error as Error).message
            }`,
          );
          this.logger.error(`Error stack: ${(error as Error).stack}`);
        });
    });
  }
}
