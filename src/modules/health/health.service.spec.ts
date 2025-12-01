import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkLiveness', () => {
    it('should return alive status', () => {
      const result = service.checkLiveness();

      expect(result.status).toBe('alive');
      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('checkReadiness', () => {
    it('should return ready when database and redis are up', async () => {
      jest.spyOn(service, 'checkDatabase').mockResolvedValue('up');
      jest.spyOn(service, 'checkRedis').mockResolvedValue('up');

      const result = await service.checkReadiness();

      expect(result.status).toBe('ready');
      expect(result.critical_dependencies.database).toBe('up');
      expect(result.critical_dependencies.redis).toBe('up');
      expect(result.timestamp).toBeDefined();
    });

    it('should return not_ready when database is down', async () => {
      jest.spyOn(service, 'checkDatabase').mockResolvedValue('down');
      jest.spyOn(service, 'checkRedis').mockResolvedValue('up');

      const result = await service.checkReadiness();

      expect(result.status).toBe('not_ready');
      expect(result.critical_dependencies.database).toBe('down');
    });

    it('should return not_ready when redis is down', async () => {
      jest.spyOn(service, 'checkDatabase').mockResolvedValue('up');
      jest.spyOn(service, 'checkRedis').mockResolvedValue('down');

      const result = await service.checkReadiness();

      expect(result.status).toBe('not_ready');
      expect(result.critical_dependencies.redis).toBe('down');
    });
  });

  describe('getDetailedHealth', () => {
    it('should return healthy status when all dependencies are up', async () => {
      jest.spyOn(service, 'checkDatabaseWithTiming').mockResolvedValue({
        status: 'up',
        responseTime: 10,
        message: 'Connected successfully',
      });
      jest.spyOn(service, 'checkRedisWithTiming').mockResolvedValue({
        status: 'up',
        responseTime: 5,
        message: 'Connected successfully',
      });
      jest.spyOn(service, 'checkSMTPWithTiming').mockResolvedValue({
        status: 'up',
        responseTime: 15,
        message: 'SMTP server verified',
      });
      jest.spyOn(service, 'checkExternalApiWithTiming').mockResolvedValue({
        status: 'up',
        responseTime: 20,
        message: 'API reachable',
      });

      const result = await service.getDetailedHealth();

      expect(result.status).toBe('healthy');
      expect(result.dependencies.database.status).toBe('up');
      expect(result.dependencies.redis.status).toBe('up');
      expect(result.dependencies.smtp.status).toBe('up');
      expect(result.dependencies.externalApi.status).toBe('up');
      expect(result.memory).toBeDefined();
      expect(result.memory.used).toBeGreaterThan(0);
      expect(result.memory.total).toBeGreaterThan(0);
      expect(result.memory.percentage).toBeGreaterThanOrEqual(0);
      expect(result.memory.activeConnections).toBeGreaterThanOrEqual(0);
      expect(result.uptime).toBeGreaterThanOrEqual(0);
      expect(result.timestamp).toBeDefined();
    });

    it('should return unhealthy when database is down', async () => {
      jest.spyOn(service, 'checkDatabaseWithTiming').mockResolvedValue({
        status: 'down',
        responseTime: 100,
        message: 'Connection failed',
      });
      jest.spyOn(service, 'checkRedisWithTiming').mockResolvedValue({
        status: 'up',
        responseTime: 5,
        message: 'Connected successfully',
      });
      jest.spyOn(service, 'checkSMTPWithTiming').mockResolvedValue({
        status: 'up',
        responseTime: 15,
        message: 'SMTP server verified',
      });
      jest.spyOn(service, 'checkExternalApiWithTiming').mockResolvedValue({
        status: 'up',
        responseTime: 20,
        message: 'API reachable',
      });

      const result = await service.getDetailedHealth();

      expect(result.status).toBe('unhealthy');
      expect(result.dependencies.database.status).toBe('down');
    });

    it('should return degraded when only non-critical services are down', async () => {
      jest.spyOn(service, 'checkDatabaseWithTiming').mockResolvedValue({
        status: 'up',
        responseTime: 10,
        message: 'Connected successfully',
      });
      jest.spyOn(service, 'checkRedisWithTiming').mockResolvedValue({
        status: 'up',
        responseTime: 5,
        message: 'Connected successfully',
      });
      jest.spyOn(service, 'checkSMTPWithTiming').mockResolvedValue({
        status: 'down',
        responseTime: 1000,
        message: 'SMTP verification failed',
      });
      jest.spyOn(service, 'checkExternalApiWithTiming').mockResolvedValue({
        status: 'down',
        responseTime: 5000,
        message: 'API unreachable',
      });

      const result = await service.getDetailedHealth();

      expect(result.status).toBe('degraded');
      expect(result.dependencies.database.status).toBe('up');
      expect(result.dependencies.redis.status).toBe('up');
      expect(result.dependencies.smtp.status).toBe('down');
      expect(result.dependencies.externalApi.status).toBe('down');
    });

    it('should use cached result within TTL', async () => {
      const checkDatabaseSpy = jest
        .spyOn(service, 'checkDatabaseWithTiming')
        .mockResolvedValue({
          status: 'up',
          responseTime: 10,
          message: 'Connected successfully',
        });
      const checkRedisSpy = jest
        .spyOn(service, 'checkRedisWithTiming')
        .mockResolvedValue({
          status: 'up',
          responseTime: 5,
          message: 'Connected successfully',
        });
      const checkSMTPSpy = jest
        .spyOn(service, 'checkSMTPWithTiming')
        .mockResolvedValue({
          status: 'up',
          responseTime: 15,
          message: 'SMTP server verified',
        });
      const checkExternalApiSpy = jest
        .spyOn(service, 'checkExternalApiWithTiming')
        .mockResolvedValue({
          status: 'up',
          responseTime: 20,
          message: 'API reachable',
        });

      // First call - should check all dependencies
      const result1 = await service.getDetailedHealth();
      expect(checkDatabaseSpy).toHaveBeenCalledTimes(1);

      // Second call immediately - should use cache
      const result2 = await service.getDetailedHealth();
      expect(checkDatabaseSpy).toHaveBeenCalledTimes(1); // Still 1, not 2
      expect(result1.timestamp).toBe(result2.timestamp); // Same cached result
    });
  });

  describe('checkServiceStatus', () => {
    it('should return true for successful fetch', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true });

      const result = await service.checkServiceStatus('https://example.com');

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith('https://example.com', {
        method: 'GET',
      });
    });

    it('should return false for failed fetch', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false });

      const result = await service.checkServiceStatus('https://example.com');

      expect(result).toBe(false);
    });

    it('should return false when fetch throws error', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const result = await service.checkServiceStatus('https://example.com');

      expect(result).toBe(false);
    });
  });
});
