import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SubscriptionCacheService {
  private readonly ttl: number;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {
    // 30 minutes default
    this.ttl = Number(this.configService.get('CACHE_TTL_USER_SUB') || 1800);
  }

  private key(userId: string) {
    return `user:${userId}:subscription`;
  }

  async get<T = any>(userId: string): Promise<T | null> {
    return (await this.cacheManager.get<T>(this.key(userId))) ?? null;
  }

  async set(userId: string, payload: any) {
    await this.cacheManager.set(this.key(userId), payload, this.ttl);
  }

  async del(userId: string) {
    await this.cacheManager.del(this.key(userId));
  }
}
