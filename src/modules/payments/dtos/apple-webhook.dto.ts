import { ApiProperty } from '@nestjs/swagger';

export class AppleWebhookPayloadDto {
  @ApiProperty()
  signedPayload: string;
}

export class AppleWebhookDataDto {
  @ApiProperty({ required: false })
  appAccountToken?: string;

  @ApiProperty({ required: false })
  originalTransactionId?: string;

  @ApiProperty({ required: false })
  transactionId?: string;

  @ApiProperty({ required: false })
  productId?: string;

  @ApiProperty({ required: false })
  purchaseDate?: string;
}

export class AppleWebhookDecodedDto {
  @ApiProperty()
  notificationType: string;

  @ApiProperty({ required: false })
  subtype?: string;

  @ApiProperty({ type: AppleWebhookDataDto, required: false })
  data?: AppleWebhookDataDto;
}
