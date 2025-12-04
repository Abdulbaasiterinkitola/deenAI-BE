import { SetMetadata } from '@nestjs/common';

export const REQUIRE_PAYMENT_KEY = 'requirePayment';

export interface RequirePaymentOptions {
  allowInactive?: boolean;
  requireValidPayment?: boolean;
  gracePeriodInDays?: number;
}

export const RequirePayment = (options: RequirePaymentOptions = {}) =>
  SetMetadata(REQUIRE_PAYMENT_KEY, options);
