import { ExecutionContext, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PaymentGuard } from './payment.guard';
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

describe('PaymentGuard', () => {
  let guard: PaymentGuard;
  let reflector: Reflector;
  let paymentStatusService: PaymentStatusService;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as Reflector;

    paymentStatusService = {
      getPaymentStatus: jest.fn(),
    } as unknown as PaymentStatusService;

    guard = new PaymentGuard(reflector, paymentStatusService);
  });

  it('throws when user is missing', async () => {
    const context = createExecutionContext();

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      CustomHttpException,
    );

    await guard.canActivate(context).catch((error: CustomHttpException) => {
      expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  it('throws when user is inactive and allowInactive is false', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue({
      allowInactive: false,
    });

    const context = createExecutionContext({ status: UserStatus.PAUSED });

    await guard.canActivate(context).catch((error: CustomHttpException) => {
      expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
    });
  });

  it('checks payment status when required', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue({
      requireValidPayment: true,
    });
    (paymentStatusService.getPaymentStatus as jest.Mock).mockResolvedValue({
      state: 'expired',
      reason: 'Subscription expired',
      isGracePeriodApplied: false,
      transaction: null,
    });

    const context = createExecutionContext({
      id: 'user-1',
      status: UserStatus.ACTIVE,
    });

    await guard.canActivate(context).catch((error: CustomHttpException) => {
      expect(error.getStatus()).toBe(HttpStatus.PAYMENT_REQUIRED);
    });
  });

  it('allows when user is active and payment is valid', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue({
      requireValidPayment: true,
    });
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

  it('respects allowInactive option', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue({
      allowInactive: true,
    });
    const context = createExecutionContext({
      id: 'user-1',
      status: UserStatus.PAUSED,
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });
});
