import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { Plan } from '../models/plan.model';

@Injectable()
export class PlansCacheService {
  private readonly ttl: number;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {
    // 1 hour default
    this.ttl = Number(this.configService.get('CACHE_TTL_PLANS') || 3600);
  }

  allKey() {
    return 'plans:all';
  }

  idKey(id: string) {
    return `plan:${id}`;
  }

  slugKey(slug: string) {
    return `plan:slug:${slug}`;
  }

  async getAll(): Promise<Plan[] | null> {
    return (await this.cacheManager.get<Plan[]>(this.allKey())) ?? null;
  }

  async setAll(plans: Plan[]) {
    await this.cacheManager.set(this.allKey(), plans, this.ttl);
  }

  async delAll() {
    await this.cacheManager.del(this.allKey());
  }

  async getById(id: string): Promise<Plan | null> {
    return (await this.cacheManager.get<Plan>(this.idKey(id))) ?? null;
  }

  async setById(id: string, plan: Plan) {
    await this.cacheManager.set(this.idKey(id), plan, this.ttl);
  }

  async delById(id: string) {
    await this.cacheManager.del(this.idKey(id));
  }

  async getBySlug(slug: string): Promise<Plan | null> {
    return (await this.cacheManager.get<Plan>(this.slugKey(slug))) ?? null;
  }

  async setBySlug(slug: string, plan: Plan) {
    await this.cacheManager.set(this.slugKey(slug), plan, this.ttl);
  }

  async delBySlug(slug: string) {
    await this.cacheManager.del(this.slugKey(slug));
  }
}
