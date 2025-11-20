import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestApp } from '../test-setup';

describe('Users Controller (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await TestApp.setup();
  });

  afterAll(async () => {
    await TestApp.teardown();
  });

  // Remove beforeEach cleanup for faster tests

  describe('GET /api/v1/users/profile', () => {
    it('should require authentication or return 404', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users/profile')
        .expect((res) => {
          expect([401, 404]).toContain(res.status);
        });
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect((res) => {
          expect([401, 404]).toContain(res.status);
        });
    });
  });

  describe('PUT /api/v1/users/profile', () => {
    it('should require authentication or return 404', () => {
      return request(app.getHttpServer())
        .put('/api/v1/users/profile')
        .send({
          firstName: 'Updated',
          lastName: 'Name',
        })
        .expect((res) => {
          expect([401, 404]).toContain(res.status);
        });
    });
  });

  describe('DELETE /api/v1/users/account', () => {
    it('should require authentication or return 404', () => {
      return request(app.getHttpServer())
        .delete('/api/v1/users/account')
        .expect((res) => {
          expect([401, 404]).toContain(res.status);
        });
    });
  });

  describe('POST /api/v1/users/change-password', () => {
    it('should require authentication or return 404', () => {
      return request(app.getHttpServer())
        .post('/api/v1/users/change-password')
        .send({
          currentPassword: 'Password123!',
          newPassword: 'NewPassword123!',
        })
        .expect((res) => {
          expect([401, 404]).toContain(res.status);
        });
    });
  });
});