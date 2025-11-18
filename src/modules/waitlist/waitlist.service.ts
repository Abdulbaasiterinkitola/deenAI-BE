import { Injectable, Logger } from '@nestjs/common';
import { WaitlistCoreService } from './services/waitlist-core.service';
import { WaitlistValidationService } from './services/waitlist-validation.service';
<<<<<<< HEAD
import { EmailService } from '@modules/email/email.service';
import { Waitlist } from './models/waitlist.model';
import { WaitlistDto } from './dtos/waitlist.dto';
=======
>>>>>>> 7b5622d97bcab8e39188d86b8dfa5e08e04dbdf4

@Injectable()
export class WaitlistService {
  private readonly logger = new Logger(WaitlistService.name);

  constructor(
    private readonly core: WaitlistCoreService,
    private readonly validation: WaitlistValidationService,
    private readonly emailService: EmailService,
  ) {}

  async register(payload) {
    const existing = await this.core.findByEmail(payload.email);
    this.validation.validateDuplicate(existing);
    const entry = await this.core.create(payload);
    await this.queueWelcomeEmail(entry);
    return entry;
  }

  private async queueWelcomeEmail(entry: Waitlist) {
    const fallbackName = entry.email?.split('@')[0] ?? 'friend';
    const name = entry.name ?? fallbackName;
    try {
      await this.emailService.sendEmail(
        entry.email,
        name,
        'Welcome to the DeenAI waitlist',
        'waitlist',
      );
      this.logger.log(`Queued waitlist welcome email for ${entry.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to queue waitlist email for ${entry.email}: ${
          (error as Error).message
        }`,
      );
    }
  }
}
