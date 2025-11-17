import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Waitlist } from '../src/entities/waitlist.entity';

describe('Waitlist (e2e)', () => {
  let app: INestApplication;
  let waitlistRepository: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(Waitlist))
      .useValue({
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    waitlistRepository = moduleFixture.get(getRepositoryToken(Waitlist));

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/waitlist (POST)', () => {
    it('should create waitlist entry with valid data', () => {
      const createDto = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const savedEntry = {
        id: 'uuid-123',
        ...createDto,
        status: 'pending',
      };

      waitlistRepository.findOne.mockResolvedValue(null);
      waitlistRepository.create.mockReturnValue(savedEntry);
      waitlistRepository.save.mockResolvedValue(savedEntry);

      return request(app.getHttpServer())
        .post('/waitlist')
        .send(createDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toBe('Successfully joined waitlist');
          expect(res.body.data.email).toBe(createDto.email);
        });
    });

    it('should return 400 for invalid email', () => {
      return request(app.getHttpServer())
        .post('/waitlist')
        .send({
          name: 'John Doe',
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('should return 400 for missing name', () => {
      return request(app.getHttpServer())
        .post('/waitlist')
        .send({
          email: 'john@example.com',
        })
        .expect(400);
    });
  });

  describe('/waitlist (GET)', () => {
    it('should return all waitlist entries', () => {
      const mockEntries = [
        { id: '1', name: 'John', email: 'john@example.com' },
        { id: '2', name: 'Jane', email: 'jane@example.com' },
      ];

      waitlistRepository.find.mockResolvedValue(mockEntries);

      return request(app.getHttpServer())
        .get('/waitlist')
        .expect(200)
        .expect(mockEntries);
    });
  });
});
