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

@ApiTags('Payments Webhooks')
@Controller('payments/webhooks')
export class PaymentsWebhookController {
  constructor(private readonly webhookService: PaymentsWebhookService) {}

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Google Play Webhooks' })
  async handleGoogleWebhook(
    @Body() payload: any,
    @Headers('Authorization') authHeader: string,
  ) {
    await this.webhookService.verifyGoogleSignature(authHeader);
    await this.webhookService.processGoogleWebhook(payload);
  }

  @Post('apple')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Apple App Store Webhooks' })
  async handleAppleWebhook(@Body() payload: any) {
    // Apple signature verification is inside the service as it needs the payload structure
    this.webhookService.verifyAppleSignature(payload);
    await this.webhookService.processAppleWebhook(payload);
  }
}
