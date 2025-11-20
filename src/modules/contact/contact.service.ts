import { Injectable, Logger } from '@nestjs/common';
import { ContactCoreService } from './services/contact-core.service';
import { ContactValidationService } from './services/contact-validation.service';
import { ContactDto } from './dtos/contact.dto';
import { ContactSubmission } from './models/contact-submission.model';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly coreService: ContactCoreService,
    private readonly validationService: ContactValidationService,
  ) {}

  async submitContact(payload: ContactDto): Promise<ContactSubmission> {
    const sanitizedPayload = this.validationService.validatePayload(payload);
    const submission =
      await this.coreService.createSubmission(sanitizedPayload);
    this.logger.log(`Contact submission stored for ${submission.email}`);
    return submission;
  }
}
