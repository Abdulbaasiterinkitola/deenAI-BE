import { Injectable } from '@nestjs/common';
import dataSource from '../../database/data-source';
import { createClient } from 'redis';
import * as nodemailer from 'nodemailer';
import {
  DetailedHealthResponseDto,
  DependencyStatusDto,
  LivenessResponseDto,
  ReadinessResponseDto,
} from './dtos/health-response.dto';

@Injectable()
export class HealthService {
  private redis = createClient({ url: process.env.REDIS_URL });
  private healthCache: {
    data: DetailedHealthResponseDto | null;
    timestamp: number;
  } = { data: null, timestamp: 0 };
  private readonly CACHE_TTL = 30000; // 30 seconds

  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  private async measureTime<T>(
    fn: () => Promise<T>,
  ): Promise<{ result: T; time: number }> {
    const start = performance.now();
    const result = await fn();
    const time = Number((performance.now() - start).toFixed(2));
    return { result, time };
  }

  private getMemoryMetrics() {
    const memUsage = process.memoryUsage();
    const used = memUsage.heapUsed;
    const total = memUsage.heapTotal;
    const percentage = Number(((used / total) * 100).toFixed(2));

    // Get active connections from process
    const activeConnections = process.getActiveResourcesInfo
      ? process.getActiveResourcesInfo().length
      : 0;

    return { used, total, percentage, activeConnections };
  }

  private aggregateStatus(dependencies: {
    database: DependencyStatusDto;
    redis: DependencyStatusDto;
    smtp: DependencyStatusDto;
    externalApi: DependencyStatusDto;
  }): 'healthy' | 'degraded' | 'unhealthy' {
    const criticalServices = [dependencies.database, dependencies.redis];
    const allServices = Object.values(dependencies);

    // If any critical service is down, system is unhealthy
    if (criticalServices.some((service) => service.status === 'down')) {
      return 'unhealthy';
    }

    // If all services are up, system is healthy
    if (allServices.every((service) => service.status === 'up')) {
      return 'healthy';
    }

    // Otherwise, system is degraded (non-critical services down)
    return 'degraded';
  }

  async checkServiceStatus(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'GET' });
      return response.ok;
    } catch {
      return false;
    }
  }

  async checkDatabase() {
    try {
      await dataSource.query('SELECT 1');
      return 'up';
    } catch {
      return 'down';
    }
  }

  async checkRedis() {
    try {
      if (!this.redis.isOpen) await this.redis.connect();
      const pong = await this.redis.ping();
      return pong === 'PONG' ? 'up' : 'down';
    } catch (err) {
      console.error(err);
      return 'down';
    }
  }

  async checkSMTP() {
    try {
      await this.transporter.verify();
      return 'up';
    } catch (err) {
      console.error(err);
      return 'down';
    }
  }

  async checkDatabaseWithTiming(): Promise<DependencyStatusDto> {
    const { result, time } = await this.measureTime(() => this.checkDatabase());
    return {
      status: result,
      responseTime: time,
      message: result === 'up' ? 'Connected successfully' : 'Connection failed',
    };
  }

  async checkRedisWithTiming(): Promise<DependencyStatusDto> {
    const { result, time } = await this.measureTime(() => this.checkRedis());
    return {
      status: result,
      responseTime: time,
      message: result === 'up' ? 'Connected successfully' : 'Connection failed',
    };
  }

  async checkSMTPWithTiming(): Promise<DependencyStatusDto> {
    const { result, time } = await this.measureTime(() => this.checkSMTP());
    return {
      status: result,
      responseTime: time,
      message:
        result === 'up' ? 'SMTP server verified' : 'SMTP verification failed',
    };
  }

  async checkExternalApiWithTiming(): Promise<DependencyStatusDto> {
    const { result, time } = await this.measureTime(() =>
      this.checkServiceStatus('https://api.ottoman.emerj.net/'),
    );
    return {
      status: result ? 'up' : 'down',
      responseTime: time,
      message: result ? 'API reachable' : 'API unreachable',
    };
  }

  async getDetailedHealth(): Promise<DetailedHealthResponseDto> {
    // Check cache first
    const now = Date.now();
    if (
      this.healthCache.data &&
      now - this.healthCache.timestamp < this.CACHE_TTL
    ) {
      return this.healthCache.data;
    }

    // Perform health checks
    const [database, redis, smtp, externalApi] = await Promise.all([
      this.checkDatabaseWithTiming(),
      this.checkRedisWithTiming(),
      this.checkSMTPWithTiming(),
      this.checkExternalApiWithTiming(),
    ]);

    const dependencies = { database, redis, smtp, externalApi };
    const status = this.aggregateStatus(dependencies);
    const memory = this.getMemoryMetrics();
    const uptime = Math.floor(process.uptime());

    const healthData: DetailedHealthResponseDto = {
      status,
      timestamp: new Date().toISOString(),
      uptime,
      memory,
      dependencies,
    };

    // Update cache
    this.healthCache = {
      data: healthData,
      timestamp: now,
    };

    return healthData;
  }

  checkLiveness(): LivenessResponseDto {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }

  async checkReadiness(): Promise<ReadinessResponseDto> {
    // Only check critical dependencies for readiness
    const database = await this.checkDatabase();
    const redis = await this.checkRedis();

    const isReady = database === 'up' && redis === 'up';

    return {
      status: isReady ? 'ready' : 'not_ready',
      critical_dependencies: {
        database: database,
        redis: redis,
      },
      timestamp: new Date().toISOString(),
    };
  }

  // Keep legacy method for backward compatibility
  async checkHealth() {
    const database = await this.checkDatabase();
    const redis = await this.checkRedis();
    const smtp = await this.checkSMTP();
    const serverOk = await this.checkServiceStatus(
      'https://api.ottoman.emerj.net/',
    );

    const isHealthy =
      database === 'up' && redis === 'up' && smtp === 'up' && serverOk === true;
    return {
      status: isHealthy ? 'ok' : 'error',
      services: {
        database,
        redis,
        smtp,
        serverOk,
        uptime: `${Math.floor(process.uptime())}s`,
      },
      timestamp: new Date().toISOString(),
      httpStatus: isHealthy ? 200 : 503,
    };
  }
}
