import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CustomHttpException } from '@shared/custom.exception';
import { User } from '@modules/users/models/user.model';
import { UserStatus } from '@modules/users/enums/user-status.enum';
import { PaymentStatusService } from '@modules/payments/services/payment-status.service';
import {
  RequirePaymentOptions,
  REQUIRE_PAYMENT_KEY,
} from './require-payment.decorator';

@Injectable()
export class PaymentGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly paymentStatusService: PaymentStatusService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options =
      this.reflector.getAllAndOverride<RequirePaymentOptions>(
        REQUIRE_PAYMENT_KEY,
        [context.getHandler(), context.getClass()],
      ) ?? {};

    const request = context.switchToHttp().getRequest<{ user?: User }>();
    const user = request.user;

    if (!user) {
      throw new CustomHttpException(
        'Authentication is required for payment actions.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!options.allowInactive && user.status !== UserStatus.ACTIVE) {
      throw new CustomHttpException(
        'Your account must be active to perform payment actions.',
        HttpStatus.FORBIDDEN,
      );
    }

    if (options.requireValidPayment) {
      const status = await this.paymentStatusService.getPaymentStatus(
        user.id,
        options.gracePeriodInDays ?? 0,
      );

      if (status.state !== 'active') {
        const message =
          status.reason ?? 'A valid payment is required for this action.';
        const httpStatus =
          status.state === 'pending'
            ? HttpStatus.ACCEPTED
            : HttpStatus.PAYMENT_REQUIRED;
        throw new CustomHttpException(message, httpStatus);
      }
    }

    return true;
  }
}
