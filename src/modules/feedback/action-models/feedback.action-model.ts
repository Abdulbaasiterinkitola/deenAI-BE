import { Injectable } from '@nestjs/common';
import { AbstractModelAction } from '@shared/abstract-model-action';
import { Feedback } from '../models/feedback.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FeedbackActionModel extends AbstractModelAction<Feedback> {
  constructor(
    @InjectRepository(Feedback)
    repository: Repository<Feedback>,
  ) {
    super(repository, Feedback);
  }
}
