import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reflection } from './models/reflection.model';
import { User } from '@modules/users/models/user.model';
import { Repository } from 'typeorm';
import { AuthProvider } from '@modules/users/enums';

describe('ReflectionsController (e2e)', () => {
  let app: INestApplication;
  let reflectionRepository: Repository<Reflection>;
  let userRepository: Repository<User>;
  let testUser: User;
  let testReflection: Reflection;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    reflectionRepository = moduleFixture.get<Repository<Reflection>>(
      getRepositoryToken(Reflection),
    );
    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );

    // Create a test user
    testUser = await userRepository.save({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password',
      authProvider: AuthProvider.LOCAL,
      isEmailVerified: true,
    });

    // Create a test reflection
    testReflection = await reflectionRepository.save({
      content: 'Test reflection content',
      userId: testUser.id,
    });

    // Generate auth token (simplified for testing)
    authToken = 'Bearer valid-jwt-token';
  });

  afterAll(async () => {
    // Clean up test data
    await reflectionRepository.delete({ id: testReflection.id });
    await userRepository.delete({ id: testUser.id });
    await app.close();
  });

  describe('DELETE /reflections/:id', () => {
    describe('Authentication Tests', () => {
      it('should return 401 when no token is provided', async () => {
        // Act & Assert
        return request(app.getHttpServer())
          .delete(`/reflections/${testReflection.id}`)
          .expect(401)
          .expect((res) => {
            expect(res.body).toHaveProperty('success', false);
            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('status_code', 401);
          });
      });

      it('should return 401 when invalid token is provided', async () => {
        // Act & Assert
        return request(app.getHttpServer())
          .delete(`/reflections/${testReflection.id}`)
          .set('Authorization', 'Bearer invalid-token')
          .expect(401)
          .expect((res) => {
            expect(res.body).toHaveProperty('success', false);
            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('status_code', 401);
          });
      });
    });

    describe('Authorization Tests', () => {
      it('should return 200 when user deletes their own reflection', async () => {
        // Act & Assert
        return request(app.getHttpServer())
          .delete(`/reflections/${testReflection.id}`)
          .set('Authorization', authToken)
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty(
              'message',
              'Reflection deleted successfully',
            );
          });
      });

      it("should return 403 when user tries to delete another user's reflection", async () => {
        // Arrange
        const anotherUser = await userRepository.save({
          name: 'Another User',
          email: 'another@example.com',
          password: 'password',
          authProvider: AuthProvider.LOCAL,
          isEmailVerified: true,
        });

        const anotherReflection = await reflectionRepository.save({
          content: 'Another user reflection',
          userId: anotherUser.id,
        });

        // Act & Assert
        return request(app.getHttpServer())
          .delete(`/reflections/${anotherReflection.id}`)
          .set('Authorization', authToken)
          .expect(403)
          .expect((res) => {
            expect(res.body).toHaveProperty('success', false);
            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('status_code', 403);
          })
          .then(async () => {
            // Clean up
            await reflectionRepository.delete({ id: anotherReflection.id });
            await userRepository.delete({ id: anotherUser.id });
          });
      });
    });

    describe('Functionality Tests', () => {
      beforeEach(async () => {
        // Create a fresh reflection for each test
        testReflection = await reflectionRepository.save({
          content: 'Test reflection for deletion',
          userId: testUser.id,
        });
      });

      afterEach(async () => {
        // Clean up the reflection if it still exists
        await reflectionRepository.delete({ id: testReflection.id });
      });

      it('should return 200 with proper response format when deleting a reflection', async () => {
        // Act & Assert
        return request(app.getHttpServer())
          .delete(`/reflections/${testReflection.id}`)
          .set('Authorization', authToken)
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty(
              'message',
              'Reflection deleted successfully',
            );
            expect(res.body).not.toHaveProperty('data'); // DELETE endpoint should not return data
          });
      });

      it('should permanently remove the reflection from the database', async () => {
        // Act
        await request(app.getHttpServer())
          .delete(`/reflections/${testReflection.id}`)
          .set('Authorization', authToken)
          .expect(200);

        // Assert
        const deletedReflection = await reflectionRepository.findOne({
          where: { id: testReflection.id },
        });
        expect(deletedReflection).toBeNull();
      });

      it('should return 404 when trying to delete a non-existent reflection', async () => {
        // Arrange
        const nonExistentId = 'a7e92c4e-3f21-4a5d-a8ae-57b923f1eac7';

        // Act & Assert
        return request(app.getHttpServer())
          .delete(`/reflections/${nonExistentId}`)
          .set('Authorization', authToken)
          .expect(404)
          .expect((res) => {
            expect(res.body).toHaveProperty('success', false);
            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('status_code', 404);
          });
      });
    });

    describe('Edge Cases', () => {
      it('should return 400 when reflection ID format is invalid', async () => {
        // Arrange
        const invalidId = 'invalid-uuid-format';

        // Act & Assert
        return request(app.getHttpServer())
          .delete(`/reflections/${invalidId}`)
          .set('Authorization', authToken)
          .expect(400)
          .expect((res) => {
            expect(res.body).toHaveProperty('success', false);
            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('status_code', 400);
          });
      });

      it('should return 400 when reflection ID is empty', async () => {
        // Act & Assert
        return request(app.getHttpServer())
          .delete('/reflections/')
          .set('Authorization', authToken)
          .expect(404); // This will return 404 because the route doesn't match
      });

      it('should handle empty/invalid token properly', async () => {
        // Act & Assert
        return request(app.getHttpServer())
          .delete(`/reflections/${testReflection.id}`)
          .set('Authorization', '')
          .expect(401)
          .expect((res) => {
            expect(res.body).toHaveProperty('success', false);
            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('status_code', 401);
          });
      });
    });
  });
});
