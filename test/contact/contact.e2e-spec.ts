import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestApp } from '../test-setup';

describe('Contact Controller (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await TestApp.setup();
  });

  afterAll(async () => {
    await TestApp.teardown();
  });

  // Remove beforeEach cleanup for faster tests

  describe('POST /api/v1/contact', () => {
    const validContact = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      subject: 'Test Subject',
      content: 'This is a test message.',
    };

    it('should submit contact form successfully', () => {
      return request(app.getHttpServer())
        .post('/api/v1/contact')
        .send(validContact)
        .expect(201)
        .expect((res) => {
          expect(res.body).toMatchObject({
            success: true,
            message: expect.any(String),
            data: expect.any(Object),
          });
        });
    });

    it('should fail with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/contact')
        .send({ name: 'John Doe' })
        .expect((res) => {
          expect([400, 422]).toContain(res.status);
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should validate email format', () => {
      return request(app.getHttpServer())
        .post('/api/v1/contact')
        .send({
          ...validContact,
          email: 'invalid-email',
        })
        .expect((res) => {
          expect([400, 422]).toContain(res.status);
        });
    });

    it('should handle special characters', () => {
      return request(app.getHttpServer())
        .post('/api/v1/contact')
        .send({
          name: 'José María',
          email: 'jose@example.com',
          subject: 'Special Characters Test',
          content: 'Special chars: áéíóú ñ @#$%^&*()_+',
        })
        .expect(201);
    });
  });
});
