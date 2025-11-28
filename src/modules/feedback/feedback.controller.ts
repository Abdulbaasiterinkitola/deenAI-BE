import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dtos/create-feedback.dto';
import { FeedbackDocs } from './docs/feedback.doc';
import { OptionalAuthGuard } from '@guards/optional-auth.guard';

@ApiTags('Feedback')
@UseGuards(OptionalAuthGuard)
@Controller('feedback')
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
