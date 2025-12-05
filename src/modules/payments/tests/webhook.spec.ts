import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsWebhookService } from '../services/payments-webhook.service';
import { SubscriptionsService } from '@modules/subscriptions/subscriptions.service';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WebhookLog } from '../models/webhook-log.model';
import { PaymentTransaction } from '../models/payment-transaction.model';
import { PaymentPlatform, PaymentStatus } from '../enums/payment.enums';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

describe('PaymentsWebhookService', () => {
  let service: PaymentsWebhookService;
  let subscriptionsService: SubscriptionsService;
  let logRepository: any;
  let transactionRepository: any;
  let testPrivateKey: string;
  let testPublicKey: string;

  beforeAll(() => {
    const keys = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    testPrivateKey = keys.privateKey;
    testPublicKey = keys.publicKey;
  });

  const mockSubscriptionsService = {
    changePlan: jest.fn(),
    cancelSubscription: jest.fn(),
    getUserByGoogleToken: jest.fn(),
    getUserByAppleId: jest.fn(),
    getPlanByProductId: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key) => {
      if (key === 'GOOGLE_PLAY_PUBLIC_KEY') {
        return Buffer.from(testPublicKey).toString('base64');
      }
      if (key === 'SKIP_WEBHOOK_VERIFICATION') return 'false';
      return null;
    }),
  };

  const mockLogRepository = {
    save: jest.fn(),
  };

  const mockTransactionRepository = {
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsWebhookService,
        { provide: SubscriptionsService, useValue: mockSubscriptionsService },
        { provide: ConfigService, useValue: mockConfigService },
        {
          provide: getRepositoryToken(WebhookLog),
          useValue: mockLogRepository,
        },
        {
          provide: getRepositoryToken(PaymentTransaction),
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    service = module.get<PaymentsWebhookService>(PaymentsWebhookService);
    subscriptionsService =
      module.get<SubscriptionsService>(SubscriptionsService);
    logRepository = module.get(getRepositoryToken(WebhookLog));
    transactionRepository = module.get(getRepositoryToken(PaymentTransaction));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyGoogleSignature', () => {
    it('should throw UnauthorizedException if header is missing', async () => {
      await expect(service.verifyGoogleSignature('')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should verify signature with local public key', async () => {
      const token = jwt.sign({ foo: 'bar' }, testPrivateKey, {
        algorithm: 'RS256',
      });
      const authHeader = `Bearer ${token}`;

      await expect(
        service.verifyGoogleSignature(authHeader),
      ).resolves.not.toThrow();
    });

    it('should throw if signature is invalid', async () => {
      // Sign with a different key
      const { privateKey: otherKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });
      const token = jwt.sign({ foo: 'bar' }, otherKey, { algorithm: 'RS256' });
      const authHeader = `Bearer ${token}`;

      await expect(service.verifyGoogleSignature(authHeader)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('processGoogleWebhook', () => {
    it('should process RENEWED notification and record transaction', async () => {
      const payload = {
        message: {
          data: Buffer.from(
            JSON.stringify({
              subscriptionNotification: {
                notificationType: 2, // RENEWED
                purchaseToken: 'token123',
                subscriptionId: 'prod123',
              },
            }),
          ).toString('base64'),
        },
      };

      mockSubscriptionsService.getUserByGoogleToken.mockResolvedValue({
        id: 'user123',
      });
      mockSubscriptionsService.getPlanByProductId.mockResolvedValue({
        id: 'plan123',
      });
      mockSubscriptionsService.changePlan.mockResolvedValue({});
      mockTransactionRepository.findOne.mockResolvedValue(null); // No existing transaction

      await service.processGoogleWebhook(payload);

      expect(
        mockSubscriptionsService.getUserByGoogleToken,
      ).toHaveBeenCalledWith('token123');
      expect(mockSubscriptionsService.getPlanByProductId).toHaveBeenCalledWith(
        'google',
        'prod123',
      );
      expect(mockSubscriptionsService.changePlan).toHaveBeenCalledWith(
        'user123',
        'plan123',
      );
      expect(mockLogRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'google',
          eventType: '2',
          userId: 'user123',
        }),
      );
      expect(mockTransactionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user123',
          planId: 'plan123',
          platform: PaymentPlatform.GOOGLE,
          transactionId: 'token123',
          productId: 'prod123',
          status: PaymentStatus.COMPLETED,
        }),
      );
    });

    it('should process CANCELED notification and NOT record transaction (as per new logic)', async () => {
      const payload = {
        message: {
          data: Buffer.from(
            JSON.stringify({
              subscriptionNotification: {
                notificationType: 3, // CANCELED
                purchaseToken: 'token123',
              },
            }),
          ).toString('base64'),
        },
      };

      mockSubscriptionsService.getUserByGoogleToken.mockResolvedValue({
        id: 'user123',
      });
      mockTransactionRepository.findOne.mockResolvedValue(null);

      await service.processGoogleWebhook(payload);

      expect(mockSubscriptionsService.cancelSubscription).toHaveBeenCalledWith(
        'user123',
      );
      // We removed transaction recording for cancellation in the service update
      expect(mockTransactionRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('processAppleWebhook', () => {
    it('should process DID_RENEW notification and record transaction', async () => {
      const header = Buffer.from(JSON.stringify({ alg: 'ES256' })).toString(
        'base64',
      );
      const body = Buffer.from(
        JSON.stringify({
          notificationType: 'DID_RENEW',
          subtype: 'AUTO_RENEW_ENABLED',
          data: {
            appAccountToken: 'user123',
            originalTransactionId: 'trans123',
            transactionId: 'trans456',
            productId: 'prod123',
            purchaseDate: new Date().toISOString(),
          },
        }),
      ).toString('base64');
      const signature = 'sig';
      const token = `${header}.${body}.${signature}`;

      const payload = { signedPayload: token };

      mockSubscriptionsService.getPlanByProductId.mockResolvedValue({
        id: 'plan123',
      });
      mockSubscriptionsService.changePlan.mockResolvedValue({});
      mockTransactionRepository.findOne.mockResolvedValue(null);

      await service.processAppleWebhook(payload);

      expect(mockSubscriptionsService.getPlanByProductId).toHaveBeenCalledWith(
        'apple',
        'prod123',
      );
      expect(mockSubscriptionsService.changePlan).toHaveBeenCalledWith(
        'user123',
        'plan123',
      );
      expect(mockLogRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'apple',
          eventType: 'DID_RENEW:AUTO_RENEW_ENABLED',
          userId: 'user123',
        }),
      );
      expect(mockTransactionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user123',
          planId: 'plan123',
          platform: PaymentPlatform.APPLE,
          transactionId: 'trans456',
          productId: 'prod123',
          status: PaymentStatus.COMPLETED,
        }),
      );
    });
  });
});
