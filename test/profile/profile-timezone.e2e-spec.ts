import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestApp } from '../test-setup';
import { App } from 'supertest/types';

describe('Profile Timezone Support (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    app = await TestApp.setup();

    // Register and login a test user
    const uniqueEmail = `timezone-test-${Date.now()}@example.com`;
    await request(app.getHttpServer() as App)
      .post('/api/v1/auth/register')
      .send({
        name: 'Timezone Test User',
        email: uniqueEmail,
        password: 'Password123!',
      });

    const loginResponse = await request(app.getHttpServer() as App)
      .post('/api/v1/auth/login')
      .send({
        email: uniqueEmail,
        password: 'Password123!',
      });

    authToken = loginResponse.body.data?.accessToken;
  });

  afterAll(async () => {
    await TestApp.teardown();
  });

  describe('PATCH /api/v1/users/me/profile - Timezone Update', () => {
    it('should update profile with valid timezone', async () => {
      const response = await request(app.getHttpServer() as App)
        .patch('/api/v1/users/me/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          timezone: 'America/New_York',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('updated');
    });

    it('should update profile with UTC timezone', async () => {
      const response = await request(app.getHttpServer() as App)
        .patch('/api/v1/users/me/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          timezone: 'UTC',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should update profile with Asia/Dubai timezone', async () => {
      const response = await request(app.getHttpServer() as App)
        .patch('/api/v1/users/me/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          timezone: 'Asia/Dubai',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should reject invalid timezone format', async () => {
      const response = await request(app.getHttpServer() as App)
        .patch('/api/v1/users/me/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          timezone: 'Invalid/Timezone',
        });

      expect([400, 422]).toContain(response.status);
    });

    it('should reject timezone with invalid characters', async () => {
      const response = await request(app.getHttpServer() as App)
        .patch('/api/v1/users/me/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          timezone: 'America/New York', // Space not allowed
        });

      expect([400, 422]).toContain(response.status);
    });

    it('should allow setting timezone to null', async () => {
      const response = await request(app.getHttpServer() as App)
        .patch('/api/v1/users/me/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          timezone: null,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app.getHttpServer() as App)
        .patch('/api/v1/users/me/profile')
        .send({
          timezone: 'America/New_York',
        });

      expect([401, 404]).toContain(response.status);
    });
  });

  describe('GET /api/v1/users/profile - Timezone in Response', () => {
    it('should include timezone in user profile response', async () => {
      // First set a timezone
      await request(app.getHttpServer() as App)
        .patch('/api/v1/users/me/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          timezone: 'Europe/London',
        });

      // Then get profile
      const response = await request(app.getHttpServer() as App)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('timezone');
      expect(response.body.data.timezone).toBe('Europe/London');
    });

    it('should return null timezone for users without timezone set', async () => {
      // Set timezone to null
      await request(app.getHttpServer() as App)
        .patch('/api/v1/users/me/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          timezone: null,
        });

      // Get profile
      const response = await request(app.getHttpServer() as App)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('timezone');
      expect(response.body.data.timezone).toBeNull();
    });
  });
});
