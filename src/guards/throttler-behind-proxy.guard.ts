import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // If user is authenticated, track by userId
    if (req.user?.id) {
      return req.user.id;
    }

    // Fallback to IP address for unauthenticated users
    // This handles requests behind a proxy by checking common headers.
    const ip =
      req.ips?.length > 0
        ? req.ips[0]
        : req.ip ||
          req.headers['x-forwarded-for'] ||
          req.headers['x-real-ip'] ||
          req.socket?.remoteAddress;
    return ip;
  }
}
