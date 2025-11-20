import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestApp } from '../test-setup';

describe('Notification Settings Controller (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await TestApp.setup();
  });

  afterAll(async () => {
    await TestApp.teardown();
  });

  // Remove beforeEach cleanup for faster tests

  describe('GET /api/v1/notification-settings/me', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .get('/api/v1/notification-settings/me')
        .expect(401);
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/notification-settings/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});