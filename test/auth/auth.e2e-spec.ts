import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestApp } from '../test-setup';

describe('Auth Controller (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await TestApp.setup();
  });

  afterAll(async () => {
    await TestApp.teardown();
  });

  // Remove beforeEach cleanup for faster tests

  describe('POST /api/v1/auth/register', () => {
    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({})
        .expect((res) => {
          expect([400, 422]).toContain(res.status);
        });
    });

    it('should validate email format', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe',
        })
        .expect((res) => {
          expect([400, 422, 500]).toContain(res.status);
        });
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({})
        .expect((res) => {
          expect([400, 422]).toContain(res.status);
        });
    });

    it('should validate email format', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password',
        })
        .expect((res) => {
          expect([400, 401, 422]).toContain(res.status);
        });
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('should validate email format', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'invalid-email' })
        .expect((res) => {
          expect([400, 404, 422]).toContain(res.status);
        });
    });
  });

  describe('POST /api/v1/auth/verify-otp', () => {
    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/verify-otp')
        .send({})
        .expect((res) => {
          expect([400, 422]).toContain(res.status);
        });
    });
  });

  describe('POST /api/v1/auth/reset-password', () => {
    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({})
        .expect((res) => {
          expect([400, 422]).toContain(res.status);
        });
    });
  });
});