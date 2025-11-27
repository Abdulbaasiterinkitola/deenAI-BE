import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import { UsersService } from '@modules/users/users.service';
import { ConfigService } from '@nestjs/config';

/**
 * Optional Auth Guard - Similar to AuthGuard but doesn't throw if no token is provided
 * Sets req.user if token is valid, otherwise leaves it undefined
 */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers.authorization;

    // If no auth header, allow request to proceed without user
    if (!authHeader) {
      return true;
    }

    const token = authHeader.split(' ')[1];

    // If no token in header, allow request to proceed without user
    if (!token) {
      return true;
    }

    let decodedToken;

    try {
      decodedToken = this.jwtService.verify(
        token as string,
        this.configService.get<JwtVerifyOptions>('auth.jwtSecret'),
      );
    } catch {
      // If token is invalid, allow request to proceed without user
      // Don't throw - this is optional auth
      return true;
    }

    if (
      typeof decodedToken !== 'object' ||
      decodedToken === null ||
      !('sub' in decodedToken)
    ) {
      // Invalid token payload, allow request to proceed without user
      return true;
    }

    try {
      const user = await this.userService.getUserByEmail(
        decodedToken.email as string,
      );

      if (user) {
        request.user = user;
      }
    } catch {
      // If user lookup fails, allow request to proceed without user
      // Don't throw - this is optional auth
    }

    return true;
  }
}
