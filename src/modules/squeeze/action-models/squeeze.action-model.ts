import { Injectable } from '@nestjs/common';
import { AbstractModelAction } from '@shared/abstract-model-action';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Squeeze } from '../models/squeeze.model';

@Injectable()
export class SqueezeActionModel extends AbstractModelAction<Squeeze> {
  constructor(
    @InjectRepository(Squeeze)
    repository: Repository<Squeeze>,
  ) {
    super(repository, Squeeze);
  }
}
