import { ConfigService } from '@nestjs/config';
import { GooglePaymentsService } from './google-payments.service';
import { VerifyGooglePurchaseDto } from '../dtos/verify-purchase.dto';
import {
  GooglePurchaseState,
  GoogleConsumptionState,
} from '../dtos/google-purchase-response.dto';
import { CustomHttpException } from '@shared/custom.exception';
import * as googleapis from 'googleapis';

jest.mock('googleapis', () => {
  const mockSubscriptionsGet = jest.fn();
  const mockProductsGet = jest.fn();
  const mockProductsConsume = jest.fn();

  const mockPublisher = {
    purchases: {
      subscriptions: { get: mockSubscriptionsGet },
      products: { get: mockProductsGet, consume: mockProductsConsume },
    },
  };

  return {
    google: {
      auth: {
        GoogleAuth: jest.fn().mockImplementation(() => ({})),
      },
      androidpublisher: jest.fn().mockReturnValue(mockPublisher),
    },
    __mocked: {
      mockSubscriptionsGet,
      mockProductsGet,
      mockProductsConsume,
    },
  };
});

describe('GooglePaymentsService', () => {
  let service: GooglePaymentsService;
  let configService: ConfigService;
  let mockSubscriptionsGet: jest.Mock;
  let mockProductsGet: jest.Mock;
  let mockProductsConsume: jest.Mock;

  const baseDto: VerifyGooglePurchaseDto = {
    productId: 'premium_monthly',
    purchaseToken: 'token-123',
    packageName: 'com.deenai.app',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSubscriptionsGet = googleapis.__mocked.mockSubscriptionsGet;
    mockProductsGet = googleapis.__mocked.mockProductsGet;
    mockProductsConsume = googleapis.__mocked.mockProductsConsume;
    configService = {
      get: jest.fn((key: string) => {
        if (key === 'payment.google.serviceAccountJson') {
          return JSON.stringify({ client_email: 'test', private_key: 'key' });
        }
        return undefined;
      }),
    } as unknown as ConfigService;

    service = new GooglePaymentsService(configService);
  });

  it('returns PURCHASED for active subscription', async () => {
    mockSubscriptionsGet.mockResolvedValueOnce({
      data: {
        orderId: 'order-1',
        paymentState: 1,
        startTimeMillis: `${Date.now() - 1000}`,
        expiryTimeMillis: `${Date.now() + 1000 * 60 * 60}`,
      },
    });

    const result = await service.verifyPurchase(baseDto);

    expect(result.state).toBe(GooglePurchaseState.PURCHASED);
    expect(result.isSubscription).toBe(true);
    expect(result.orderId).toBe('order-1');
  });

  it('returns PENDING for subscription with paymentState 0', async () => {
    mockSubscriptionsGet.mockResolvedValueOnce({
      data: {
        paymentState: 0,
        startTimeMillis: `${Date.now() - 1000}`,
        expiryTimeMillis: `${Date.now() + 1000 * 60 * 60}`,
      },
    });

    const result = await service.verifyPurchase(baseDto);

    expect(result.state).toBe(GooglePurchaseState.PENDING);
  });

  it('returns CANCELED for subscription with cancelReason', async () => {
    mockSubscriptionsGet.mockResolvedValueOnce({
      data: {
        cancelReason: 0,
        expiryTimeMillis: `${Date.now() + 1000 * 60 * 60}`,
      },
    });

    const result = await service.verifyPurchase(baseDto);
    expect(result.state).toBe(GooglePurchaseState.CANCELED);
  });

  it('returns EXPIRED for past-due subscription', async () => {
    mockSubscriptionsGet.mockResolvedValueOnce({
      data: {
        expiryTimeMillis: `${Date.now() - 1000 * 60}`,
      },
    });

    const result = await service.verifyPurchase(baseDto);
    expect(result.state).toBe(GooglePurchaseState.EXPIRED);
  });

  it('falls back to product and consumes when not consumed', async () => {
    mockSubscriptionsGet.mockRejectedValueOnce({ code: 404 });
    mockProductsGet.mockResolvedValueOnce({
      data: {
        orderId: 'prod-order',
        purchaseState: 0,
        consumptionState: 0,
        purchaseTimeMillis: `${Date.now() - 1000}`,
      },
    });
    mockProductsConsume.mockResolvedValueOnce({});

    const result = await service.verifyPurchase(baseDto);

    expect(result.isSubscription).toBe(false);
    expect(result.state).toBe(GooglePurchaseState.PURCHASED);
    expect(result.consumptionState).toBe(GoogleConsumptionState.NOT_CONSUMED);
    expect(mockProductsConsume).toHaveBeenCalledTimes(1);
  });

  it('marks product as PENDING when purchaseState is pending', async () => {
    mockSubscriptionsGet.mockRejectedValueOnce({ code: 404 });
    mockProductsGet.mockResolvedValueOnce({
      data: {
        purchaseState: 2,
        consumptionState: 0,
      },
    });

    const result = await service.verifyPurchase(baseDto);
    expect(result.state).toBe(GooglePurchaseState.PENDING);
  });

  it('marks product as CANCELED when purchaseState indicates cancel', async () => {
    mockSubscriptionsGet.mockRejectedValueOnce({ code: 404 });
    mockProductsGet.mockResolvedValueOnce({
      data: {
        purchaseState: 1,
        consumptionState: 1,
      },
    });

    const result = await service.verifyPurchase(baseDto);
    expect(result.state).toBe(GooglePurchaseState.CANCELED);
  });

  it('throws when product lookup fails with 404', async () => {
    mockSubscriptionsGet.mockRejectedValueOnce({ code: 404 });
    mockProductsGet.mockRejectedValueOnce({ code: 404 });

    await expect(service.verifyPurchase(baseDto)).rejects.toBeInstanceOf(
      CustomHttpException,
    );
  });

  it('throws when credentials are invalid', async () => {
    (configService.get as jest.Mock).mockReturnValueOnce('not-json');

    await expect(service.verifyPurchase(baseDto)).rejects.toBeInstanceOf(
      CustomHttpException,
    );
  });
});
