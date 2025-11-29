import { Injectable, Logger } from '@nestjs/common';
import { SqueezeCoreService } from './services/squeeze-core.service';
import { Squeeze } from './models/squeeze.model';
import { SqueezeDto } from './dtos/squeeze.dto';

@Injectable()
export class SqueezeService {
  private readonly logger = new Logger(SqueezeService.name);

  constructor(private readonly core: SqueezeCoreService) {}

  async register(payload: SqueezeDto) {
    const entry = await this.core.create(payload);

    this.logger.log(`Registration complete for: ${payload.email}`);
    return {
      message: 'Squeeze registration successful',
      data: entry,
    };
  }
}
