import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlansService } from './plans.service';
import { PlansCoreService } from './services/plans-core.service';
import { PlansValidationService } from './services/plans-validation.service';
import { PlanModelAction } from './model-actions/plan.model-action';
import { Plan } from './models/plan.model';
import { PlansCacheService } from './services/plans-cache.service';
import { PlansWarmService } from './services/plans-warm.service';
import { PlansController } from './plans.controller'; // if exists in your repo

@Module({
  imports: [TypeOrmModule.forFeature([Plan])],
  controllers: [PlansController].filter(Boolean) as any, // keep if present
  providers: [
    PlansService,
    PlansCoreService,
    PlansValidationService,
    PlanModelAction,
    PlansCacheService,
    PlansWarmService,
  ],
  exports: [PlansService, PlansCoreService, PlansCacheService],
})
export class PlansModule {}
