import { Injectable, HttpStatus } from '@nestjs/common';
import { PaymentTransactionModelAction } from '../action-models/payment-transaction.model-action';
import { CustomHttpException } from '@shared/custom.exception';
import { PaginationMeta } from '@shared/helpers/pagination.helper';
import { PaymentTransaction } from '../models/payment-transaction.model';
import { PaymentStatus } from '../enums/payment.enums';

@Injectable()
export class PaymentsQueryService {
  constructor(
    private readonly paymentTransactionModelAction: PaymentTransactionModelAction,
  ) {}

  async getUserTransactions(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ items: PaymentTransaction[]; meta: Partial<PaginationMeta> }> {
    const { payload, paginationMeta } =
      await this.paymentTransactionModelAction.list({
        filterRecordOptions: { userId },
        paginationPayload: { page, limit },
        order: { purchaseDate: 'DESC' },
        relations: ['plan'],
      });

    return { items: payload, meta: paginationMeta };
  }

  async getTransactionById(
    transactionId: string,
    userId: string,
  ): Promise<PaymentTransaction> {
    const transaction = await this.paymentTransactionModelAction.get(
      { id: transactionId, userId },
      {},
      ['plan'],
    );

    if (!transaction) {
      throw new CustomHttpException(
        'Transaction not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return transaction;
  }

  async getActiveSubscription(
    userId: string,
  ): Promise<PaymentTransaction | null> {
    const result = await this.paymentTransactionModelAction.list({
      filterRecordOptions: {
        userId,
        status: PaymentStatus.COMPLETED,
      },
      paginationPayload: { page: 1, limit: 1 },
      order: { purchaseDate: 'DESC' },
    });

    const latest = result.payload[0];

    if (latest && latest.expirationDate) {
      if (new Date() > latest.expirationDate) {
        return null;
      }
    }

    return latest || null;
  }

  async findByTransactionId(
    transactionId: string,
  ): Promise<PaymentTransaction | null> {
    return this.paymentTransactionModelAction.get({ transactionId });
  }
}