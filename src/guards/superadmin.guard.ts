import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { User } from '@modules/users/models/user.model';
import { CustomHttpException } from '@shared/custom.exception';

@Injectable()
export class SuperadminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    if (!user) {
      throw new CustomHttpException('Access forbidden', 403);
    }

    if (user.isSuperadmin !== true) {
      throw new CustomHttpException('Access forbidden', 403);
    }

    return true;
  }
}
