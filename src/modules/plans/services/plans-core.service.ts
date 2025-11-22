import { Injectable } from '@nestjs/common';
import { PlanModelAction } from '../model-actions/plan.model-action';
import { Plan } from '../models/plan.model';
import { PaginationMeta } from '@shared/helpers/pagination.helper';
import { PlanQueryDto } from '../dto/plan-query.dto';

@Injectable()
export class PlansCoreService {
  constructor(private readonly planModelAction: PlanModelAction) {}

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

  async seedDefaults(plans: Partial<Plan>[]) {
    for (const plan of plans) {
      const existing = await this.planModelAction.get({ slug: plan.slug });
      if (existing) {
        await this.planModelAction.update({
          updatePayload: plan,
          identifierOptions: { id: existing.id },
        });
        continue;
      }

      await this.planModelAction.create({
        createPayload: plan,
      });
    }
  }
}
