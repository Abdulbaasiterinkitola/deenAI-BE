import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ThrottlerModuleOptions,
  ThrottlerOptionsFactory,
} from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';

@Injectable()
export class ThrottlerConfigService implements ThrottlerOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createThrottlerOptions(): ThrottlerModuleOptions {
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';
    return {
      // Default rate limits for all endpoints. Can be overridden by @Throttle decorator.
      throttlers: [
        {
          // Stricter limits for unauthenticated users in production
          limit: isProduction ? 20 : 100,
          ttl: 60 * 1000, // 1 minute in milliseconds
        },
      ],
      storage: new ThrottlerStorageRedisService(
        this.configService.get<string>('REDIS_URL'),
      ),
    };
  }
}
