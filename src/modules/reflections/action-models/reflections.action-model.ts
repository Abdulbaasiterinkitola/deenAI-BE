import { Injectable } from '@nestjs/common';
import { AbstractModelAction } from '@shared/abstract-model-action';
import { Reflection } from '../models/reflection.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ReflectionsActionModel extends AbstractModelAction<Reflection> {
  constructor(
    @InjectRepository(Reflection)
    repository: Repository<Reflection>,
  ) {
    super(repository, Reflection);
  }
}
