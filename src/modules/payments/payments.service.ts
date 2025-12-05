import { Injectable } from '@nestjs/common';
import { PaymentsCoreService } from './services/payments-core.service';
import { PaymentsQueryService } from './services/payments-query.service';
import {
  VerifyGooglePurchaseDto,
  VerifyApplePurchaseDto,
} from './dtos/verify-purchase.dto';
import { PaymentPlatform } from './enums/payment.enums';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsCoreService: PaymentsCoreService,
    private readonly paymentsQueryService: PaymentsQueryService,
  ) {}

  async verifyGooglePurchase(userId: string, dto: VerifyGooglePurchaseDto) {
    return this.paymentsCoreService.verifyAndProcessPurchase(
      PaymentPlatform.GOOGLE,
      userId,
      dto,
    );
  }

  async verifyApplePurchase(userId: string, dto: VerifyApplePurchaseDto) {
    return this.paymentsCoreService.verifyAndProcessPurchase(
      PaymentPlatform.APPLE,
      userId,
      dto,
    );
  }

  async getUserTransactions(userId: string, page: number, limit: number) {
    return this.paymentsQueryService.getUserTransactions(userId, page, limit);
  }

  async getTransactionById(transactionId: string, userId: string) {
    return this.paymentsQueryService.getTransactionById(transactionId, userId);
  }
}