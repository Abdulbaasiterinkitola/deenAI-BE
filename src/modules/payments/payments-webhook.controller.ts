import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentsWebhookService } from './services/payments-webhook.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GoogleWebhookPayloadDto } from './dtos/google-webhook.dto';
import { AppleWebhookPayloadDto } from './dtos/apple-webhook.dto';

@ApiTags('Payments Webhooks')
@Controller('payments/webhooks')
export class PaymentsWebhookController {
  constructor(private readonly webhookService: PaymentsWebhookService) {}

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Google Play Webhooks' })
  async handleGoogleWebhook(
    @Body() payload: GoogleWebhookPayloadDto,
    @Headers('Authorization') authHeader: string,
  ) {
    try {
      await this.webhookService.verifyGoogleSignature(authHeader);
      await this.webhookService.processGoogleWebhook(payload);
    } catch (error) {
      // Re-throw to let NestJS handle it (will return appropriate HTTP status)
      throw error;
    }
  }

  @Post('apple')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Apple App Store Webhooks' })
  async handleAppleWebhook(@Body() payload: AppleWebhookPayloadDto) {
    try {
      // Apple signature verification is inside the service as it needs the payload structure
      this.webhookService.verifyAppleSignature(payload);
      await this.webhookService.processAppleWebhook(payload);
    } catch (error) {
      // Re-throw to let NestJS handle it (will return appropriate HTTP status)
      throw error;
    }
  }
}
