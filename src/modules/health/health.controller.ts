import { Controller, Get, HttpException } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthDocs } from './docs/health.docs';

@Controller('health')
@HealthDocs.tags()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @HealthDocs.check()
  async check() {
    const result = await this.healthService.checkHealth();

    if (result.httpStatus !== 200) {
      throw new HttpException(result, result.httpStatus);
    }

    return {
      status: result.status,
      services: result.services,
      timestamp: result.timestamp,
    };
  }
}
