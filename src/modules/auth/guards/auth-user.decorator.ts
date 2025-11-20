import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { User } from '../../users/models/user.model'; 


export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as User;

    if (!user) {
      
      throw new UnauthorizedException('Authentication required: User data missing from request context.');
    }
   
    return user;
  },
);