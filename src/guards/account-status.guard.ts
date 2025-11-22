import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserStatus } from '@modules/users/enums/user-status.enum';
import { User } from '@modules/users/models/user.model';

@Injectable()
export class AccountStatusGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    // This guard assumes that AuthGuard has already run and attached the user object.
    if (!user) {
      // This should not be reached if AuthGuard is always used first.
      return false;
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
