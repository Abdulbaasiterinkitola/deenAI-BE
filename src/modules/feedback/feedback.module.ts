import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from './models/feedback.model';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { FeedbackCoreService } from './services/feedback-core.service';
import { FeedbackActionModel } from './action-models/feedback.action-model';
import { FeedbackNameHelperService } from './services/feedback-name-helper.service';
import { EmailServiceModule } from '@modules/email/email.module';
import { UsersModule } from '@modules/users/users.module';
import { AuthModule } from '@modules/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Feedback]),
    EmailServiceModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [FeedbackController],
  providers: [
    FeedbackService,
    FeedbackCoreService,
    FeedbackActionModel,
    FeedbackNameHelperService,
  ],
})
export class FeedbackModule {}
