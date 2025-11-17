import { Injectable } from '@nestjs/common';
import { WaitlistCoreService } from './services/waitlist-core.service';
import { WaitlistValidationService } from './services/waitlist-validation.service';

@Injectable()
export class WaitlistService {
  constructor(
    private readonly core: WaitlistCoreService,
    private readonly validation: WaitlistValidationService,
  ) {}

  async register(payload) {
    const existing = await this.core.findByEmail(payload.email);
    this.validation.validateDuplicate(existing);
    return this.core.create(payload);
  }
}
