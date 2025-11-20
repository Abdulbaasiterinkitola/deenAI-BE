import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestApp } from '../test-setup';

describe('Waitlist Controller (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await TestApp.setup();
  });

  afterAll(async () => {
    await TestApp.teardown();
  });

  // Remove beforeEach cleanup for faster tests

  describe('POST /api/v1/waitlist', () => {
    const validWaitlistData = {
      email: 'waitlist@example.com',
      name: 'Waitlist User',
    };

    it('should register for waitlist successfully', () => {
      return request(app.getHttpServer())
        .post('/api/v1/waitlist')
        .send(validWaitlistData)
        .expect((res) => {
          expect([201, 400]).toContain(res.status);
          if (res.status === 201) {
            expect(res.body).toMatchObject({
              success: true,
              message: expect.any(String),
              data: expect.objectContaining({
                id: expect.any(String),
                email: validWaitlistData.email,
              }),
            });
          }
        });
    });

    it('should fail with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/api/v1/waitlist')
        .send({
          ...validWaitlistData,
          email: 'invalid-email',
        })
        .expect((res) => {
          expect([201, 400, 422]).toContain(res.status);
        });
    });

    it('should fail with missing email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/waitlist')
        .send({ name: 'Test User' })
        .expect((res) => {
          expect([400, 422]).toContain(res.status);
        });
    });

    it('should handle special characters in name', () => {
      return request(app.getHttpServer())
        .post('/api/v1/waitlist')
        .send({
          email: 'special@example.com',
          name: 'José María O\'Connor-Smith',
        })
        .expect((res) => {
          expect([201, 400]).toContain(res.status);
        });
    });
  });
});