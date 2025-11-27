import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from './models/feedback.model';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { FeedbackCoreService } from './services/feedback-core.service';
import { FeedbackActionModel } from './action-models/feedback.action-model';

@Module({
  imports: [TypeOrmModule.forFeature([Feedback])],
  controllers: [FeedbackController],
  providers: [
    FeedbackService,
    FeedbackCoreService,
    FeedbackActionModel,
  ],
})
export class FeedbackModule {}
