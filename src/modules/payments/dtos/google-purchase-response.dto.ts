import { ApiProperty } from '@nestjs/swagger';

export enum GooglePurchaseState {
  PURCHASED = 'PURCHASED',
  PENDING = 'PENDING',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
}

export enum GoogleConsumptionState {
  NOT_CONSUMED = 'NOT_CONSUMED',
  CONSUMED = 'CONSUMED',
}

export class GooglePurchaseResponseDto {
  @ApiProperty()
  productId: string;

  @ApiProperty()
  purchaseToken: string;

  @ApiProperty()
  packageName: string;

  @ApiProperty({ enum: GooglePurchaseState })
  state: GooglePurchaseState;

  @ApiProperty({ enum: GoogleConsumptionState, required: false })
  consumptionState?: GoogleConsumptionState;

  @ApiProperty()
  isSubscription: boolean;

  @ApiProperty({ required: false })
  orderId?: string;

  @ApiProperty({ required: false, type: String, format: 'date-time' })
  purchaseTime?: Date | null;

  @ApiProperty({ required: false, type: String, format: 'date-time' })
  expirationTime?: Date | null;

  @ApiProperty({ required: false })
  acknowledged?: boolean;

  @ApiProperty({ required: false })
  rawResponse?: Record<string, unknown>;
}
