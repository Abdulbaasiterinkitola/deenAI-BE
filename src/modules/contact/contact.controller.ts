import { Body, Controller, Logger, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ContactService } from './contact.service';
import { ContactDto } from './dtos/contact.dto';
import { ContactDocs } from './docs/contact.doc';
import { Public } from '../../guards/public.decorator';

@Controller('contact')
@ContactDocs.tag
@Throttle({
  default: { limit: 3, ttl: 60 * 1000 }, // 3 requests per minute
})
export class ContactController {
  private readonly logger = new Logger(ContactController.name);

  constructor(private readonly contactService: ContactService) {}

  @Post()
  @Public()
  @ContactDocs.submit()
  async submit(@Body() body: ContactDto) {
    this.logger.log(`Contact submission initiated for ${body.email}`);
    const data = await this.contactService.submitContact(body);
    return {
      success: true,
      message: 'Contact form submitted successfully',
      data,
    };
  }
}
