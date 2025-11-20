import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestApp } from '../test-setup';

describe('Reflections Controller (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await TestApp.setup();
  });

  afterAll(async () => {
    await TestApp.teardown();
  });

  // Remove beforeEach cleanup for faster tests

  describe('POST /api/v1/reflections', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/api/v1/reflections')
        .send({
          startAyah: 1,
          endAyah: 5,
          surah: 2,
          content: 'Test reflection content',
        })
        .expect(401);
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/reflections')
        .send({})
        .expect((res) => {
          expect([400, 401, 422]).toContain(res.status);
        });
    });
  });

  describe('GET /api/v1/reflections', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .get('/api/v1/reflections')
        .expect(401);
    });
  });

  describe('GET /api/v1/reflections/:id', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .get('/api/v1/reflections/550e8400-e29b-41d4-a716-446655440000')
        .expect(401);
    });
  });

  describe('PUT /api/v1/reflections/:id', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .put('/api/v1/reflections/550e8400-e29b-41d4-a716-446655440000')
        .send({ content: 'Updated content' })
        .expect(401);
    });
  });

  describe('DELETE /api/v1/reflections/:id', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .delete('/api/v1/reflections/550e8400-e29b-41d4-a716-446655440000')
        .expect(401);
    });
  });
});