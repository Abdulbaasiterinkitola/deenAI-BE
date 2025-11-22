import { Injectable } from '@nestjs/common';
import { PlansValidationService } from './services/plans-validation.service';
import { PlansCoreService } from './services/plans-core.service';
import { PlanQueryDto } from './dto/plan-query.dto';
import { PlanResponseDto } from './dto/plan-response.dto';
import { CustomHttpException } from '@shared/custom.exception';
import { HttpStatus } from '@nestjs/common';
import { Plan } from './models/plan.model';

@Injectable()
export class PlansService {
  constructor(
    private readonly plansValidationService: PlansValidationService,
    private readonly plansCoreService: PlansCoreService,
  ) {}

  async getAll(query: PlanQueryDto) {
    this.plansValidationService.validatePagination(query.page, query.limit);
    const { items, paginationMeta } =
      await this.plansCoreService.listPlans(query);
    return {
      items: items.map((plan) => PlanResponseDto.fromEntity(plan)),
      paginationMeta,
    };
  }

  async getById(id: string) {
    this.plansValidationService.validateId(id);
    const plan = await this.plansCoreService.getPlanById(id);
    if (!plan) {
      throw new CustomHttpException('Plan not found', HttpStatus.NOT_FOUND);
    }
    return PlanResponseDto.fromEntity(plan);
  }

  async getBySlug(slug: string): Promise<Plan | null> {
    return this.plansCoreService.getPlanBySlug(slug);
  }
}
