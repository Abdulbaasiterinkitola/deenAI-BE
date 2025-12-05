import { ApiProperty } from '@nestjs/swagger';
import { PaymentPlatform, PaymentStatus } from '../enums/payment.enums';
import { PaginationMetaDto } from '@shared/dtos/pagination-meta.dto';

export class PaymentTransactionResponseDto {
  @ApiProperty({ example: 'a7e92c4e-3f21-4a5d-a8ae-57b923f1eac7' })
  id: string;

  @ApiProperty({ example: 'b8f03d5f-4g32-5b6e-b9bf-68c034g2fbd8' })
  userId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  planId: string;

  @ApiProperty({ enum: PaymentPlatform, example: PaymentPlatform.GOOGLE })
  platform: PaymentPlatform;

  @ApiProperty({ example: 'GPA.3312-4412-1234-56789' })
  transactionId: string;

  @ApiProperty({ example: 'premium_monthly' })
  productId: string;

  @ApiProperty()
  purchaseDate: Date;

  @ApiProperty({ nullable: true })
  expirationDate: Date | null;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.COMPLETED })
  status: PaymentStatus;

  @ApiProperty({ example: false })
  isTrialPeriod: boolean;

  @ApiProperty()
  createdAt: Date;
}

export class VerifyPurchaseResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Purchase verified and processed successfully' })
  message: string;

  @ApiProperty({ type: PaymentTransactionResponseDto })
  data: PaymentTransactionResponseDto;
}

export class PaginatedTransactionsResponseDto {
  @ApiProperty({ type: [PaymentTransactionResponseDto] })
  items: PaymentTransactionResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
