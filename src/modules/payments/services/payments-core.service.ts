import { Injectable } from '@nestjs/common';
import { PaymentTransactionModelAction } from '../action-models/payment-transaction.model-action';

@Injectable()
export class PaymentsCoreService {
  constructor(
    private readonly paymentTransactionModelAction: PaymentTransactionModelAction,
  ) {}

  // Basic CRUD placeholders for future logic
}
