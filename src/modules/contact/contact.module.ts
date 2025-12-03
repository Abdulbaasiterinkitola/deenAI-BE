import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { ContactSubmission } from './models/contact-submission.model';
import { ContactSubmissionActionModel } from './action-models/contact-submission.action-model';
import { ContactCoreService } from './services/contact-core.service';
import { ContactValidationService } from './services/contact-validation.service';
import { EmailServiceModule } from '@modules/email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([ContactSubmission]), EmailServiceModule],
  controllers: [ContactController],
  providers: [
    ContactService,
    ContactSubmissionActionModel,
    ContactCoreService,
    ContactValidationService,
  ],
  exports: [ContactService],
})
export class ContactModule {}
