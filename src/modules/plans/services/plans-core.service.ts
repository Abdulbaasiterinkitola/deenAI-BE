import { Injectable } from '@nestjs/common';
import { PlanModelAction } from '../model-actions/plan.model-action';
import { Plan } from '../models/plan.model';
import { PaginationMeta } from '@shared/helpers/pagination.helper';
import { PlanQueryDto } from '../dto/plan-query.dto';
import { PlansCacheService } from './plans-cache.service';

@Injectable()
export class PlansCoreService {
  constructor(
    private readonly planModelAction: PlanModelAction,
    private readonly plansCacheService: PlansCacheService,
  ) {}

  async listPlans(
    query: PlanQueryDto,
  ): Promise<{ items: Plan[]; paginationMeta: Partial<PaginationMeta> }> {
    const { page = 1, limit = 10 } = query;

    const { payload, paginationMeta } = await this.planModelAction.list({
      paginationPayload: { page, limit },
      order: { displayOrder: 'ASC' } as any,
    });

    return { items: payload, paginationMeta };
  }

  async getPlanById(id: string): Promise<Plan | null> {
    return this.planModelAction.get({ id });
  }

  async getPlanBySlug(slug: string): Promise<Plan | null> {
    return this.planModelAction.get({ slug });
  }

  async seedDefaults(plans: Partial<Plan>[]) {
    for (const plan of plans) {
      const existing = await this.planModelAction.get({ slug: plan.slug });
      if (existing) {
        await this.planModelAction.update({
          updatePayload: plan,
          identifierOptions: { id: existing.id },
        });

        // invalidate caches for updated plan
        await this.plansCacheService.delById(existing.id);
        if (plan.slug) await this.plansCacheService.delBySlug(plan.slug);
        await this.plansCacheService.delAll();
        continue;
      }

      const created = await this.planModelAction.create({
        createPayload: plan,
      });

      // invalidate after create to ensure list/get returns fresh values
      await this.plansCacheService.delAll();
      if (created && created.id) {
        await this.plansCacheService.delById(created.id);
      }
    }
  }
}
