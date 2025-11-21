import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestApp } from '../test-setup';
import { App } from 'supertest/types';

describe('Health Controller (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await TestApp.setup();
  });

  afterAll(async () => {
    await TestApp.teardown();
  });

  // Remove beforeEach cleanup for faster tests

  describe('GET /health', () => {
    it('should return health status', () => {
      return request(app.getHttpServer() as App)
        .get('/health')
        .expect((res) => {
          expect(res.status).toBeGreaterThanOrEqual(200);
          expect(res.body).toBeDefined();
          expect(res.body).toHaveProperty('httpStatus');
        });
    });
  });
});
