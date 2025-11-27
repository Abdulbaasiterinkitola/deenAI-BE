import { SetMetadata } from '@nestjs/common';

export const IS_ACCOUNT_STATUS_CHECK_SKIPPED_KEY =
  'isAccountStatusCheckSkipped';
export const SkipAccountStatusCheck = () =>
  SetMetadata(IS_ACCOUNT_STATUS_CHECK_SKIPPED_KEY, true);
