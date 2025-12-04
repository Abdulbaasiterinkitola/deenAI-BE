import { Injectable } from '@nestjs/common';
import { PaymentTransactionModelAction } from '../action-models/payment-transaction.model-action';
import { PaymentTransaction } from '../models/payment-transaction.model';
import { PaymentStatus } from '../enums/payment.enums';

export type PaymentState =
  | 'active'
  | 'pending'
  | 'refunded'
  | 'cancelled'
  | 'failed'
  | 'expired'
  | 'missing';

export interface PaymentStatusResult {
  state: PaymentState;
  transaction: PaymentTransaction | null;
  reason?: string;
  isGracePeriodApplied: boolean;
}

@Injectable()
export class PaymentStatusService {
  private readonly millisecondsInDay = 24 * 60 * 60 * 1000;

  constructor(
    private readonly paymentTransactionModelAction: PaymentTransactionModelAction,
  ) {}

  async getLatestTransaction(
    userId: string,
  ): Promise<PaymentTransaction | null> {
    const { payload } = await this.paymentTransactionModelAction.list({
      filterRecordOptions: { userId },
      paginationPayload: { page: 1, limit: 1 },
      order: { purchaseDate: 'DESC' },
    });

    return payload[0] ?? null;
  }

  async getPaymentStatus(
    userId: string,
    gracePeriodInDays: number = 0,
  ): Promise<PaymentStatusResult> {
    const latestTransaction = await this.getLatestTransaction(userId);

    if (!latestTransaction) {
      return {
        state: 'missing',
        transaction: null,
        reason: 'No payment record found.',
        isGracePeriodApplied: false,
      };
    }

    if (latestTransaction.status === PaymentStatus.REFUNDED) {
      return {
        state: 'refunded',
        transaction: latestTransaction,
        reason: 'Last payment was refunded.',
        isGracePeriodApplied: false,
      };
    }

    if (latestTransaction.status === PaymentStatus.CANCELLED) {
      return {
        state: 'cancelled',
        transaction: latestTransaction,
        reason: 'Payment was cancelled.',
        isGracePeriodApplied: false,
      };
    }

    if (latestTransaction.status === PaymentStatus.FAILED) {
      return {
        state: 'failed',
        transaction: latestTransaction,
        reason: 'Last payment attempt failed.',
        isGracePeriodApplied: false,
      };
    }

    if (latestTransaction.status === PaymentStatus.PENDING) {
      return {
        state: 'pending',
        transaction: latestTransaction,
        reason: 'Payment is still pending confirmation.',
        isGracePeriodApplied: false,
      };
    }

    if (latestTransaction.status !== PaymentStatus.COMPLETED) {
      return {
        state: 'failed',
        transaction: latestTransaction,
        reason: 'Payment is not completed.',
        isGracePeriodApplied: false,
      };
    }

    const normalizedGraceDays = gracePeriodInDays > 0 ? gracePeriodInDays : 0;
    const gracePeriodMs = normalizedGraceDays * this.millisecondsInDay;
    const now = Date.now();

    if (latestTransaction.expirationDate) {
      const expirationTime = latestTransaction.expirationDate.getTime();
      const graceWindow = expirationTime + gracePeriodMs;

      if (now > graceWindow) {
        return {
          state: 'expired',
          transaction: latestTransaction,
          reason: 'Subscription has expired.',
          isGracePeriodApplied: false,
        };
      }

      return {
        state: 'active',
        transaction: latestTransaction,
        reason: undefined,
        isGracePeriodApplied: now > expirationTime,
      };
    }

    return {
      state: 'active',
      transaction: latestTransaction,
      reason: undefined,
      isGracePeriodApplied: false,
    };
  }
}
