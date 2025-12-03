import { Injectable } from '@nestjs/common';
import { PlansValidationService } from './services/plans-validation.service';
import { PlansCoreService } from './services/plans-core.service';
import { PlanQueryDto } from './dto/plan-query.dto';
import { PlanResponseDto } from './dto/plan-response.dto';
import { CustomHttpException } from '@shared/custom.exception';
import { HttpStatus } from '@nestjs/common';
import { Plan } from './models/plan.model';
import { PlansCacheService } from './services/plans-cache.service';

@Injectable()
export class PlansService {
  constructor(
    private readonly plansValidationService: PlansValidationService,
    private readonly plansCoreService: PlansCoreService,
    private readonly plansCacheService: PlansCacheService,
  ) {}

  async getAll(query: PlanQueryDto) {
    this.plansValidationService.validatePagination(query.page, query.limit);

    // Try reading cached full list first
    const cached = await this.plansCacheService.getAll();
    if (cached) {
      const items = cached.map((plan) => PlanResponseDto.fromEntity(plan));
      // approximate pagination meta from full list
      return {
        items,
        paginationMeta: { total: items.length, page: 1, limit: items.length },
      };
    }

    // Fallback to DB
    const { items, paginationMeta } = await this.plansCoreService.listPlans(query);

    if (items && items.length) {
      // warm full list cache
      await this.plansCacheService.setAll(items as Plan[]);
    }

    return {
      items: items.map((plan) => PlanResponseDto.fromEntity(plan)),
      paginationMeta,
    };
  }

  async getById(id: string) {
    this.plansValidationService.validateId(id);

    const cached = await this.plansCacheService.getById(id);
    if (cached) return PlanResponseDto.fromEntity(cached);

    const plan = await this.plansCoreService.getPlanById(id);
    if (!plan) {
      throw new CustomHttpException('Plan not found', HttpStatus.NOT_FOUND);
    }
    await this.plansCacheService.setById(id, plan);
    return PlanResponseDto.fromEntity(plan);
  }

  async getBySlug(slug: string): Promise<Plan | null> {
    const cached = await this.plansCacheService.getBySlug(slug);
    if (cached) return cached;
    const plan = await this.plansCoreService.getPlanBySlug(slug);
    if (plan) await this.plansCacheService.setBySlug(slug, plan);
    return plan;
  }

  async getPlanById(id: string): Promise<Plan | null> {
    // internal (returns Plan), use cache
    const cached = await this.plansCacheService.getById(id);
    if (cached) return cached;
    const plan = await this.plansCoreService.getPlanById(id);
    if (plan) await this.plansCacheService.setById(id, plan);
    return plan;
  }
}
