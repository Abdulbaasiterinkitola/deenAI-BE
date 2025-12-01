import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    // Adjust to your user structure: e.g., user?.role === 'admin' or user?.isAdmin
    if (!user || !(user.isAdmin || user.role === 'admin')) {
      throw new ForbiddenException('Admin privileges required');
    }
    return true;
  }
}
