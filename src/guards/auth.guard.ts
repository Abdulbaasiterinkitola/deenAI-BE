import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import { UsersService } from '@modules/users/users.service';
import { CustomHttpException } from '@shared/custom.exception';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new CustomHttpException('Authorization Header Missing', 401);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new CustomHttpException('Invalid authorization format', 401);
    }

    let decodedToken;

    try {
      decodedToken = this.jwtService.verify(
        token as string,
        this.configService.get<JwtVerifyOptions>('auth.jwtSecret'),
      );
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new CustomHttpException('Token has expired', 401);
      }

      if (error.name === 'JsonWebTokenError') {
        throw new CustomHttpException('Authentication failed', 401);
      }

      throw new CustomHttpException('Internal server error', 500);
    }

    if (
      typeof decodedToken !== 'object' ||
      decodedToken === null ||
      !('sub' in decodedToken)
    ) {
      throw new CustomHttpException('Invalid token payload', 401);
    }

    const user = await this.userService.getUserByEmail(
      decodedToken.email as string,
    );

    if (!user) {
      throw new CustomHttpException('User not found', 404);
    }

    request.user = user;

    return true;
  }
}
