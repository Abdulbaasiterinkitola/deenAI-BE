import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserStatus } from '@modules/users/enums/user-status.enum';
import { User } from '@modules/users/models/user.model';
import { IS_ACCOUNT_STATUS_CHECK_SKIPPED_KEY } from './skip-account-status-check.decorator';

@Injectable()
export class AccountStatusGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isSkipped = this.reflector.getAllAndOverride<boolean>(
      IS_ACCOUNT_STATUS_CHECK_SKIPPED_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isSkipped) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    // If there is no user, it means the endpoint is public (not protected by AuthGuard).
    // In this case, the guard should not block access.
    if (!user) {
      return true;
    }

    // Allow access ONLY if the account status is 'active'.
    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException(
        'Your account is not active. Please reactivate your account to continue.',
      );
    }

    return true;
  }
}
