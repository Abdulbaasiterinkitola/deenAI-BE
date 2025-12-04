import { SetMetadata } from '@nestjs/common';

export const REQUIRE_ACTIVE_SUBSCRIPTION_KEY = 'requireActiveSubscription';

export interface RequireActiveSubscriptionOptions {
  gracePeriodInDays?: number;
}

export const RequireActiveSubscription = (
  options: RequireActiveSubscriptionOptions = {},
) => SetMetadata(REQUIRE_ACTIVE_SUBSCRIPTION_KEY, options);
