import { Injectable } from '@nestjs/common';
import { AbstractModelAction } from '@shared/abstract-model-action';
import { Reciter } from './models/reciter.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ReciterModelAction extends AbstractModelAction<Reciter> {
  constructor(@InjectRepository(Reciter) repository: Repository<Reciter>) {
    super(repository, Reciter);
  }
}
 