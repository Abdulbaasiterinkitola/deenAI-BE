import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailDto } from './dtos/email.dto';
@Controller()
export class EmailServiceController {
  constructor(private readonly emailServiceService: EmailService) {}

  @Post('email')
  async sendEmail(@Body() dto: EmailDto) {
    await this.emailServiceService.sendEmail(
      dto.email,
      dto.name,
      dto.subject,
      dto.template,
    );
    return {
      success: true,
      message:
        'Email event handled (check service logs for actual sending status)',
    };
  }
}
