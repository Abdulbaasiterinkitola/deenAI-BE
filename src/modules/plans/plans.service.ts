import { Injectable } from '@nestjs/common';
import { PlansValidationService } from './services/plans-validation.service';
import { PlansCoreService } from './services/plans-core.service';
import { PlanQueryDto } from './dto/plan-query.dto';
import { PlanResponseDto } from './dto/plan-response.dto';
import { CustomHttpException } from '@shared/custom.exception';
import { HttpStatus } from '@nestjs/common';
import { Plan } from './models/plan.model';
import { PlansCacheService } from './services/plans-cache.service';
import { computePaginationMeta } from '@shared/helpers/pagination.helper';

@Injectable()
export class PlansService {
  constructor(
    private readonly plansValidationService: PlansValidationService,
    private readonly plansCoreService: PlansCoreService,
    private readonly plansCacheService: PlansCacheService,
  ) {}

  async getAll(query: PlanQueryDto) {
    this.plansValidationService.validatePagination(query.page, query.limit);

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    // Try reading cached full list first
    const cached = await this.plansCacheService.getAll();
    if (cached) {
      // Apply pagination to cached results
      const total = cached.length;
      const skip = (page - 1) * limit;
      const paginatedPlans = cached.slice(skip, skip + limit);
      const items = paginatedPlans.map((plan) =>
        PlanResponseDto.fromEntity(plan),
      );
      const paginationMeta = computePaginationMeta(total, limit, page);

      return {
        items,
        paginationMeta,
      };
    }

    // Fallback to DB
    const { items, paginationMeta } =
      await this.plansCoreService.listPlans(query);

    if (items && items.length) {
      // Cache full list for future requests
      await this.plansCacheService.setAll(items);
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

  async getPlanByProductId(
    provider: 'google' | 'apple',
    productId: string,
  ): Promise<Plan | null> {
    return this.plansCoreService.getPlanByProductId(provider, productId);
  }
}
