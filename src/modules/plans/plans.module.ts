import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { Plan } from './models/plan.model';
import { PlanModelAction } from './model-actions/plan.model-action';
import { PlansValidationService } from './services/plans-validation.service';
import { PlansCoreService } from './services/plans-core.service';

@Module({
  imports: [TypeOrmModule.forFeature([Plan])],
  controllers: [PlansController],
  providers: [
    PlansService,
    PlanModelAction,
    PlansValidationService,
    PlansCoreService,
  ],
  exports: [PlansService, PlansCoreService, PlanModelAction],
})
export class PlansModule {}
