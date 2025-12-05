import { PaymentStatusService } from './payment-status.service';
import { PaymentTransactionModelAction } from '../action-models/payment-transaction.model-action';
import { PaymentTransaction } from '../models/payment-transaction.model';
import { PaymentPlatform, PaymentStatus } from '../enums/payment.enums';

describe('PaymentStatusService', () => {
  let paymentTransactionModelAction: PaymentTransactionModelAction;
  let service: PaymentStatusService;

  const mockList = (transactions: PaymentTransaction[]) => {
    jest
      .spyOn(paymentTransactionModelAction, 'list')
      .mockResolvedValue({ payload: transactions, paginationMeta: {} });
  };

  const buildTransaction = (
    status: PaymentStatus,
    expirationOffsetDays?: number,
  ): PaymentTransaction =>
    ({
      id: 'txn-1',
      userId: 'user-1',
      planId: 'plan-1',
      platform: PaymentPlatform.APPLE,
      transactionId: 'txn-id',
      productId: 'product-1',
      purchaseDate: new Date(),
      expirationDate:
        expirationOffsetDays !== undefined
          ? new Date(Date.now() + expirationOffsetDays * 24 * 60 * 60 * 1000)
          : null,
      status,
      isTrialPeriod: false,
      isIntroductoryPricePeriod: false,
      rawResponse: null,
      originalTransactionId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }) as PaymentTransaction;

  beforeEach(() => {
    paymentTransactionModelAction = {
      list: jest.fn(),
    } as unknown as PaymentTransactionModelAction;
    service = new PaymentStatusService(paymentTransactionModelAction);
  });

  it('returns missing when no transactions exist', async () => {
    mockList([]);

    const status = await service.getPaymentStatus('user-1');

    expect(status.state).toBe('missing');
    expect(status.transaction).toBeNull();
  });

  it('marks transaction as refunded', async () => {
    mockList([buildTransaction(PaymentStatus.REFUNDED)]);

    const status = await service.getPaymentStatus('user-1');

    expect(status.state).toBe('refunded');
    expect(status.reason).toMatch(/refunded/i);
  });

  it('marks transaction as pending', async () => {
    mockList([buildTransaction(PaymentStatus.PENDING)]);

    const status = await service.getPaymentStatus('user-1');

    expect(status.state).toBe('pending');
  });

  it('returns expired when past grace window', async () => {
    mockList([buildTransaction(PaymentStatus.COMPLETED, -5)]);

    const status = await service.getPaymentStatus('user-1', 2);

    expect(status.state).toBe('expired');
  });

  it('applies grace period when within window', async () => {
    mockList([buildTransaction(PaymentStatus.COMPLETED, -1)]);

    const status = await service.getPaymentStatus('user-1', 3);

    expect(status.state).toBe('active');
    expect(status.isGracePeriodApplied).toBe(true);
  });

  it('returns active when not expired and completed', async () => {
    mockList([buildTransaction(PaymentStatus.COMPLETED, 10)]);

    const status = await service.getPaymentStatus('user-1');

    expect(status.state).toBe('active');
    expect(status.transaction).not.toBeNull();
  });
});
