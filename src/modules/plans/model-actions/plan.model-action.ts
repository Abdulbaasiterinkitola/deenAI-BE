import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractModelAction } from '@shared/abstract-model-action';
import { Plan } from '../models/plan.model';

@Injectable()
export class PlanModelAction extends AbstractModelAction<Plan> {
  constructor(
    @InjectRepository(Plan)
    repository: Repository<Plan>,
  ) {
    super(repository, Plan);
  }
}
