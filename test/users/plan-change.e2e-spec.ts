import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestApp, createTestUser } from '../test-setup';
import { JwtService } from '@nestjs/jwt';

describe('Plan Change (e2e)', () => {
    let app: INestApplication;
    let jwtService: JwtService;
    let token: string;

    beforeAll(async () => {
        app = await TestApp.setup();
        jwtService = app.get(JwtService);

        const dataSource = TestApp.getDataSource();
        const user = await createTestUser(dataSource);
        token = jwtService.sign({ sub: user.id, email: user.email });
    });

    afterAll(async () => {
        await TestApp.teardown();
    });

    it('should return 401 for unauthenticated request', async () => {
        await request(app.getHttpServer())
            .patch('/api/v1/users/plan')
            .send({ planId: '123e4567-e89b-12d3-a456-426614174000' })
            .expect(401);
    });

    it('should return 400 for invalid planId format', async () => {
        await request(app.getHttpServer())
            .patch('/api/v1/users/plan')
            .set('Authorization', `Bearer ${token}`)
            .send({ planId: 'invalid-uuid' })
            .expect(400);
    });

    it('should return 400 for missing planId', async () => {
        await request(app.getHttpServer())
            .patch('/api/v1/users/plan')
            .set('Authorization', `Bearer ${token}`)
            .send({})
            .expect(400);
    });
});
