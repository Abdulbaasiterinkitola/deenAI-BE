import { Controller, Post, Body, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dtos/create-feedback.dto';
import { FeedbackDocs } from './docs/feedback.doc';

@ApiTags('Feedback')
@Controller('feedback')
@Throttle({
  default: { limit: 3, ttl: 60 * 1000 }, // 3 requests per minute
})
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @FeedbackDocs.createFeedback()
  async createFeedback(@Body() dto: CreateFeedbackDto, @Request() req: any) {
    return this.feedbackService.createFeedback(
      req.user,
      dto.title,
      dto.description,
    );
  }
}
