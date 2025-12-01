import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestApp, createTestUser } from '../test-setup';
import { JwtService } from '@nestjs/jwt';

describe('Reflections Limit (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let token: string;
  let userId: string;

  beforeAll(async () => {
    app = await TestApp.setup();
    jwtService = app.get(JwtService);

    // Create a test user
    const user = await createTestUser(TestApp.getDataSource());
    userId = user.id;

    // Generate a real JWT token
    token = jwtService.sign({ sub: userId, email: user.email });
  });

  afterAll(async () => {
    await TestApp.teardown();
  });

  it('should enforce limit of 10 reflections', async () => {
    // Create 10 reflections
    for (let i = 0; i < 10; i++) {
      await request(app.getHttpServer() as Parameters<typeof request>[0])
        .post('/api/v1/reflections')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'quran',
          startAyah: 1,
          endAyah: 5,
          surah: 2,
          content: `Reflection ${i + 1}`,
        })
        .expect((res) => {
          if (res.status !== 201) {
            process.stdout.write(
              `Reflection ${i + 1} failed: ${JSON.stringify(res.body, null, 2)}\n`,
            );
          }
        })
        .expect(201);
    }

    // Attempt to create the 11th reflection
    await request(app.getHttpServer() as Parameters<typeof request>[0])
      .post('/api/v1/reflections')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'quran',
        startAyah: 1,
        endAyah: 5,
        surah: 2,
        content: 'Reflection 11',
      })
      .expect(403)
      .expect((res) => {
        expect(res.body.message).toBe(
          'Plan limit reached. You can only create 10 reflections.',
        );
      });
  });
});
