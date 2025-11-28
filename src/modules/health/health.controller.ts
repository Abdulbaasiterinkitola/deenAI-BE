import { Controller, Get, HttpException } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthDocs } from './docs/health.docs';
import { Public } from '../../guards/public.decorator';

@Controller('health')
@HealthDocs.tags()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @Public()
  @HealthDocs.check()
  async check() {
    const result = await this.healthService.checkHealth();

    if (result.httpStatus !== 200) {
      throw new HttpException(result, result.httpStatus);
    }

    return {
      success: true,
      status: 'success',
      message: 'Health check completed',
      data: {
        status: result.status,
        services: result.services,
        timestamp: result.timestamp,
      },
      status_code: 200,
    };
  }
}
