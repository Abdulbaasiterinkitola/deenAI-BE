import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractModelAction } from '@shared/abstract-model-action';
import { ContactSubmission } from '../models/contact-submission.model';

@Injectable()
export class ContactSubmissionActionModel extends AbstractModelAction<ContactSubmission> {
  constructor(
    @InjectRepository(ContactSubmission)
    repository: Repository<ContactSubmission>,
  ) {
    super(repository, ContactSubmission);
  }
}
