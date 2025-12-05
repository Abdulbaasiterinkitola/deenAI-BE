import { ExecutionContext, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionGuard } from './subscription.guard';
import { ActiveSubscriptionGuard } from './active-subscription.guard';
import {
  SubscriptionSnapshot,
  SubscriptionsService,
} from '@modules/subscriptions/subscriptions.service';
import { PaymentStatusService } from '@modules/payments/services/payment-status.service';
import { CustomHttpException } from '@shared/custom.exception';
import { UserStatus } from '@modules/users/enums/user-status.enum';
import { User } from '@modules/users/models/user.model';

const createExecutionContext = (user?: Partial<User>): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  }) as unknown as ExecutionContext;

describe('Subscription related guards', () => {
  let reflector: Reflector;
  let subscriptionsService: SubscriptionsService;
  let paymentStatusService: PaymentStatusService;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as Reflector;

    subscriptionsService = {
      getActiveSubscriptionForUser: jest.fn(),
    } as unknown as SubscriptionsService;

    paymentStatusService = {
      getPaymentStatus: jest.fn(),
    } as unknown as PaymentStatusService;
  });

  describe('SubscriptionGuard', () => {
    let guard: SubscriptionGuard;

    beforeEach(() => {
      guard = new SubscriptionGuard(
        reflector,
        subscriptionsService,
        paymentStatusService,
      );
    });

    it('allows when no feature is required', async () => {
      (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);

      const context = createExecutionContext();

      await expect(guard.canActivate(context)).resolves.toBe(true);
    });

    it('throws when user is missing', async () => {
      (reflector.getAllAndOverride as jest.Mock).mockReturnValue('chat');

      const context = createExecutionContext();

      await guard.canActivate(context).catch((error: CustomHttpException) => {
        expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      });
    });

    it('throws when subscription is missing', async () => {
      (reflector.getAllAndOverride as jest.Mock).mockReturnValue('chat');
      (
        subscriptionsService.getActiveSubscriptionForUser as jest.Mock
      ).mockResolvedValue(null);

      const context = createExecutionContext({
        id: 'user-1',
        status: UserStatus.ACTIVE,
      });

      await guard.canActivate(context).catch((error: CustomHttpException) => {
        expect(error.getStatus()).toBe(HttpStatus.PAYMENT_REQUIRED);
      });
    });

    it('throws when payment is not active', async () => {
      (reflector.getAllAndOverride as jest.Mock).mockReturnValue('chat');
      (
        subscriptionsService.getActiveSubscriptionForUser as jest.Mock
      ).mockResolvedValue({
        plan: { features: ['chat'], slug: 'premium' },
        userStatus: UserStatus.ACTIVE,
      } as SubscriptionSnapshot);
      (paymentStatusService.getPaymentStatus as jest.Mock).mockResolvedValue({
        state: 'expired',
        reason: 'Subscription expired.',
        transaction: null,
        isGracePeriodApplied: false,
      });

      const context = createExecutionContext({
        id: 'user-1',
        status: UserStatus.ACTIVE,
      });

      await guard.canActivate(context).catch((error: CustomHttpException) => {
        expect(error.getStatus()).toBe(HttpStatus.PAYMENT_REQUIRED);
      });
    });

    it('throws when feature is not allowed', async () => {
      (reflector.getAllAndOverride as jest.Mock).mockReturnValue('chat');
      (
        subscriptionsService.getActiveSubscriptionForUser as jest.Mock
      ).mockResolvedValue({
        plan: { features: ['bookmarks'], slug: 'premium' },
        userStatus: UserStatus.ACTIVE,
      } as SubscriptionSnapshot);
      (paymentStatusService.getPaymentStatus as jest.Mock).mockResolvedValue({
        state: 'active',
        transaction: {} as never,
        reason: undefined,
        isGracePeriodApplied: false,
      });

      const context = createExecutionContext({
        id: 'user-1',
        status: UserStatus.ACTIVE,
      });

      await guard.canActivate(context).catch((error: CustomHttpException) => {
        expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
      });
    });

    it('allows when feature is allowed and payment active', async () => {
      (reflector.getAllAndOverride as jest.Mock).mockReturnValue('chat');
      (
        subscriptionsService.getActiveSubscriptionForUser as jest.Mock
      ).mockResolvedValue({
        plan: { features: ['chat'], slug: 'premium' },
        userStatus: UserStatus.ACTIVE,
      } as SubscriptionSnapshot);
      (paymentStatusService.getPaymentStatus as jest.Mock).mockResolvedValue({
        state: 'active',
        transaction: {} as never,
        reason: undefined,
        isGracePeriodApplied: false,
      });

      const context = createExecutionContext({
        id: 'user-1',
        status: UserStatus.ACTIVE,
      });

      await expect(guard.canActivate(context)).resolves.toBe(true);
    });
  });

  describe('ActiveSubscriptionGuard', () => {
    let guard: ActiveSubscriptionGuard;

    beforeEach(() => {
      guard = new ActiveSubscriptionGuard(
        reflector,
        subscriptionsService,
        paymentStatusService,
      );
    });

    it('throws when user is missing', async () => {
      const context = createExecutionContext();

      await guard.canActivate(context).catch((error: CustomHttpException) => {
        expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      });
    });

    it('throws when user is inactive', async () => {
      const context = createExecutionContext({
        id: 'user-1',
        status: UserStatus.PAUSED,
      });

      await guard.canActivate(context).catch((error: CustomHttpException) => {
        expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
      });
    });

    it('throws when subscription is free', async () => {
      (
        subscriptionsService.getActiveSubscriptionForUser as jest.Mock
      ).mockResolvedValue({
        plan: { features: ['chat'], slug: 'free' },
        userStatus: UserStatus.ACTIVE,
      } as SubscriptionSnapshot);
      (paymentStatusService.getPaymentStatus as jest.Mock).mockResolvedValue({
        state: 'active',
        transaction: {} as never,
        reason: undefined,
        isGracePeriodApplied: false,
      });

      const context = createExecutionContext({
        id: 'user-1',
        status: UserStatus.ACTIVE,
      });

      await guard.canActivate(context).catch((error: CustomHttpException) => {
        expect(error.getStatus()).toBe(HttpStatus.PAYMENT_REQUIRED);
      });
    });

    it('throws when payment is expired', async () => {
      (
        subscriptionsService.getActiveSubscriptionForUser as jest.Mock
      ).mockResolvedValue({
        plan: { features: ['chat'], slug: 'premium' },
        userStatus: UserStatus.ACTIVE,
      } as SubscriptionSnapshot);
      (paymentStatusService.getPaymentStatus as jest.Mock).mockResolvedValue({
        state: 'expired',
        transaction: null,
        reason: 'Expired.',
        isGracePeriodApplied: false,
      });

      const context = createExecutionContext({
        id: 'user-1',
        status: UserStatus.ACTIVE,
      });

      await guard.canActivate(context).catch((error: CustomHttpException) => {
        expect(error.getStatus()).toBe(HttpStatus.PAYMENT_REQUIRED);
      });
    });

    it('allows when subscription and payment are active', async () => {
      (
        subscriptionsService.getActiveSubscriptionForUser as jest.Mock
      ).mockResolvedValue({
        plan: { features: ['chat'], slug: 'premium' },
        userStatus: UserStatus.ACTIVE,
      } as SubscriptionSnapshot);
      (paymentStatusService.getPaymentStatus as jest.Mock).mockResolvedValue({
        state: 'active',
        transaction: {} as never,
        reason: undefined,
        isGracePeriodApplied: false,
      });

      const context = createExecutionContext({
        id: 'user-1',
        status: UserStatus.ACTIVE,
      });

      await expect(guard.canActivate(context)).resolves.toBe(true);
    });
  });
});
