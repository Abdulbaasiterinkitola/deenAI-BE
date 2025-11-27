import { Controller, Post, Body, Request, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dtos/create-feedback.dto';
import { FeedbackDocs } from './docs/feedback.doc';

@ApiTags('feedback')
@Controller('feedback')
export class FeedbackController {
  private readonly logger = new Logger(FeedbackController.name);

  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @FeedbackDocs.createFeedback()
  async createFeedback(@Body() dto: CreateFeedbackDto, @Request() req: any) {
    // debug: log the user payload so we can see where the name comes from
    this.logger.debug(`req.user: ${JSON.stringify(req.user)}`);

    const user = req.user ?? {};
    const name =
      (typeof user.name === 'string' && user.name.trim()) ||
      (typeof user.fullName === 'string' && user.fullName.trim()) ||
      (typeof user.full_name === 'string' && user.full_name.trim()) ||
      (typeof user.username === 'string' && user.username.trim()) ||
      (typeof user.email === 'string' && user.email.split('@')[0]) ||
      (user.profile && (user.profile.name || user.profile.fullName)) ||
      'anonymous';

    return this.feedbackService.createFeedback(
      name,
      dto.title,
      dto.description,
    );
  }
}
