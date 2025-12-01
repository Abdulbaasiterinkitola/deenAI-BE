import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ThrottlerModuleOptions,
  ThrottlerOptionsFactory,
} from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';

@Injectable()
export class ThrottlerConfigService implements ThrottlerOptionsFactory {
  private readonly logger = new Logger(ThrottlerConfigService.name);

  constructor(private readonly configService: ConfigService) {}

  createThrottlerOptions(): ThrottlerModuleOptions {
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';
    
    let redisUrl = this.configService.get<string>('REDIS_URL');
    
    if (!redisUrl) {
      const redisHost = this.configService.get<string>('REDIS_HOST') || '127.0.0.1';
      const redisPort = this.configService.get<number>('REDIS_PORT') || 6379;
      redisUrl = `redis://${redisHost}:${redisPort}`;
      this.logger.log(
        `Redis URL not set, constructing from REDIS_HOST and REDIS_PORT: ${redisUrl}`,
      );
    }

    this.logger.log(`Configuring throttler with Redis at: ${redisUrl}`);
    
    // Create storage - errors will be handled by the unhandledRejection handler in main.ts
    const storage = new ThrottlerStorageRedisService(redisUrl);

    return {
      // Default rate limits for all endpoints. Can be overridden by @Throttle decorator.
      throttlers: [
        {
          // Stricter limits for unauthenticated users in production
          limit: isProduction ? 20 : 100,
          ttl: 60 * 1000, // 1 minute in milliseconds
        },
      ],
      storage,
    };
  }
}
