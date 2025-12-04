import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { PlansCacheService } from './plans-cache.service';
import { PlansCoreService } from './plans-core.service';
import { ConfigService } from '@nestjs/config';
import { PlanQueryDto } from '../dto/plan-query.dto';

@Injectable()
export class PlansWarmService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PlansWarmService.name);

  constructor(
    private readonly plansCache: PlansCacheService,
    private readonly plansCore: PlansCoreService,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const shouldWarm =
      (this.configService.get('CACHE_WARM_ON_START') || 'false') === 'true';
    if (!shouldWarm) return;

    try {
      const res = await this.plansCore.listPlans({
        page: 1,
        limit: 1000,
      } as PlanQueryDto);
      const items = res?.items ?? [];
      if (items && items.length) {
        await this.plansCache.setAll(items);
        this.logger.log(
          `Successfully warmed plans cache with ${items.length} items`,
        );
      }
    } catch (err) {
      // Don't crash boot because warming failed
      this.logger.warn(`Failed to warm plans cache: ${(err as Error).message}`);
    }
  }
}
