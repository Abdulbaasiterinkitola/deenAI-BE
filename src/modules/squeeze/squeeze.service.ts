import { Injectable, Logger } from '@nestjs/common';
import { SqueezeCoreService } from './services/squeeze-core.service';
import { SqueezeValidationService } from './services/squeeze-validation.service';
import { Squeeze } from './models/squeeze.model';

@Injectable()
export class SqueezeService {
  private readonly logger = new Logger(SqueezeService.name);

  constructor(
    private readonly core: SqueezeCoreService,
    private readonly validation: SqueezeValidationService,
  ) {}

  async register(payload): Promise<Squeeze> {
    const existing = await this.core.findByEmail(payload.email as string);
    this.validation.validateDuplicate(existing);
    const entry = await this.core.create(payload);

    this.logger.log(`Registration complete for: ${payload.email}`);
    return entry;
  }
}
