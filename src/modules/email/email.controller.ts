import { Controller, Post, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { EmailService } from './email.service';
import { EmailDto } from './dtos/email.dto';
import { Public } from '../../guards/public.decorator';

@Controller()
@Throttle({
  default: { limit: 3, ttl: 60 * 1000 }, // 3 requests per minute
})
export class EmailServiceController {
  constructor(private readonly emailServiceService: EmailService) {}

  @Post('email')
  @Public()
  async sendEmail(@Body() dto: EmailDto) {
    await this.emailServiceService.sendEmail(
      dto.email,
      dto.subject,
      dto.template,
      { name: dto.name },
    );
    return {
      success: true,
      message:
        'Email event handled (check service logs for actual sending status)',
    };
  }
}
