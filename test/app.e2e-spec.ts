import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestApp } from './test-setup';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await TestApp.setup();
  });

  afterAll(async () => {
    await TestApp.teardown();
  });

  // Remove beforeEach cleanup for faster tests

  describe('GET /', () => {
    it('should return app info', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeDefined();
        });
    });
  });

  describe('API Prefix', () => {
    it('should have correct API prefix for protected routes', () => {
      return request(app.getHttpServer())
        .get('/api/v1/reflections')
        .expect((res) => {
          expect(res.status).not.toBe(404);
        });
    });
  });
});