import { Injectable } from '@nestjs/common';
import { ContactSubmissionActionModel } from '../action-models/contact-submission.action-model';
import { ContactSubmission } from '../models/contact-submission.model';
import { ContactDto } from '../dtos/contact.dto';

@Injectable()
export class ContactCoreService {
  constructor(
    private readonly contactSubmissionActionModel: ContactSubmissionActionModel,
  ) {}

  async createSubmission(payload: ContactDto): Promise<ContactSubmission> {
    const submission = await this.contactSubmissionActionModel.create({
      createPayload: payload,
    });

    if (!submission) {
      throw new Error('Failed to create contact submission');
    }

    return submission;
  }
}
