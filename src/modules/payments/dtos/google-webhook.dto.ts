import { ApiProperty } from '@nestjs/swagger';

export class GoogleWebhookMessageDto {
  @ApiProperty()
  data: string;
}

export class GoogleWebhookPayloadDto {
  @ApiProperty({ type: GoogleWebhookMessageDto })
  message: GoogleWebhookMessageDto;
}

export class GoogleSubscriptionNotificationDto {
  @ApiProperty()
  notificationType: number;

  @ApiProperty({ required: false })
  purchaseToken?: string;

  @ApiProperty({ required: false })
  subscriptionId?: string;
}
