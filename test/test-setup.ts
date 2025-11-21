import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource, DeepPartial, ObjectLiteral } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { AppModule } from '../src/app.module';
import { ResponseInterceptor } from '@shared/response.interceptor';
import { ValidationExceptionFilter } from '@shared/validation-exception.filter';

// Mock all external services
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  }),
}));

// In-memory store for mocked DB
const globalStore = new Map<string, any>();
const globalReflectionCountStore = new Map<string, number>();

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('typeorm', () => ({
  ...jest.requireActual('typeorm'),
  DataSource: jest.fn().mockImplementation(() => ({
    isInitialized: true,
    initialize: jest.fn().mockResolvedValue(undefined),
    runMigrations: jest.fn().mockResolvedValue([]),
    entityMetadatas: [],
    query: jest.fn().mockResolvedValue([]),
    getRepository: jest.fn().mockImplementation((entity) => {
      return {
        create: jest.fn().mockImplementation((dto) => ({ ...dto, id: 'test-id' })),
        save: jest.fn().mockImplementation((data) => {
          const id = data.id || 'test-id';
          const saved = { ...data, id };
          globalStore.set(id, saved);
          // Also index by email for user lookup
          if (saved.email) {
            globalStore.set(saved.email, saved);
          }
          // Track reflection count
          if (data.content && data.userId) {
            const count = globalReflectionCountStore.get(data.userId) || 0;
            globalReflectionCountStore.set(data.userId, count + 1);
          }
          return Promise.resolve(saved);
        }),
        find: jest.fn().mockResolvedValue([]),
        findOne: jest.fn().mockImplementation((options) => {
          if (options.where && options.where.email) {
            return Promise.resolve(globalStore.get(options.where.email) || null);
          }
          return Promise.resolve(null);
        }),
        count: jest.fn().mockImplementation((options) => {
          if (options.where && options.where.userId) {
            return Promise.resolve(globalReflectionCountStore.get(options.where.userId) || 0);
          }
          return Promise.resolve(0);
        })
      };
    }),
    options: {
      type: 'postgres',
    },
  })),
}));

jest.mock('react', () => ({
  createElement: jest.fn(),
  Fragment: 'Fragment',
}));

jest.mock('@react-email/render', () => ({
  render: jest.fn().mockReturnValue('<div>Mocked Email</div>'),
}));

// Mock email templates
jest.mock('../src/modules/email/templates/waitlist-email', () => {
  return jest.fn().mockReturnValue('<div>Waitlist Email</div>');
});

jest.mock('../src/modules/email/templates/welcome-email', () => {
  return jest.fn().mockReturnValue('<div>Welcome Email</div>');
});

jest.mock('../src/modules/email/templates/otp-email', () => {
  return jest.fn().mockReturnValue('<div>OTP Email</div>');
});

export class TestApp {
  private static app: INestApplication;
  private static dataSource: DataSource;

  static async setup(): Promise<INestApplication> {
    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.DB_USERNAME = 'test';
    process.env.DB_PASSWORD = 'test';
    process.env.DB_NAME = 'test';
    process.env.JWT_SECRET = 'test-secret';
    process.env.MAIL_HOST = 'test';
    process.env.MAIL_PORT = '587';
    process.env.MAIL_USER = 'test';
    process.env.MAIL_PASS = 'test';

    // Suppress unhandled promise rejections during tests
    process.removeAllListeners('unhandledRejection');
    process.on('unhandledRejection', () => { });

    // Suppress console logs during tests
    jest.spyOn(console, 'log').mockImplementation(() => { });
    jest.spyOn(console, 'error').mockImplementation(() => { });
    jest.spyOn(console, 'warn').mockImplementation(() => { });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .setLogger({
        log: () => { },
        error: () => { },
        warn: () => { },
        debug: () => { },
        verbose: () => { },
      })
      .overrideProvider('EmailService')
      .useValue({
        sendEmail: jest.fn().mockResolvedValue({ success: true }),
        addEmailToQueue: jest.fn().mockResolvedValue({ success: true }),
      })
      .overrideProvider('ProcessMail')
      .useValue({
        sendEmail: jest.fn().mockResolvedValue(undefined),
        sendEmailDirectly: jest.fn().mockResolvedValue(undefined),
      })
      .compile();

    this.app = moduleFixture.createNestApplication();

    // Apply global configurations
    this.app.useGlobalPipes(new ValidationPipe());
    this.app.useGlobalInterceptors(new ResponseInterceptor());
    this.app.useGlobalFilters(new ValidationExceptionFilter());

    // Set API prefix
    this.app.setGlobalPrefix('api/v1', {
      exclude: ['/', 'health', 'api', 'api/v1', 'api/docs', 'probe'],
    });

    await this.app.init();

    this.dataSource = this.app.get<DataSource>(getDataSourceToken());
    await this.runMigrations();

    return this.app;
  }

  static async cleanup(): Promise<void> {
    if (this.dataSource && this.dataSource.isInitialized) {
      // Clear in-memory store if needed
      globalStore.clear();
      globalReflectionCountStore.clear();
    }
  }

  static async teardown(): Promise<void> {
    if (this.app) {
      await this.app.close();
    }
  }

  static getApp(): INestApplication {
    return this.app;
  }

  static getDataSource(): DataSource {
    return this.dataSource;
  }

  private static async runMigrations(): Promise<void> {
    if (this.dataSource && this.dataSource.isInitialized) {
      const migrations = await this.dataSource.runMigrations();
      if (migrations.length > 0) {
        console.log(`Ran ${migrations.length} migration(s) for test database`);
      }
    }
  }
}

export const createTestUser = async (
  dataSource: DataSource,

  userData: any = {},
): Promise<any> => {
  const userRepository = dataSource.getRepository('User');
  const testUser = userRepository.create({
    email: 'test@example.com',
    password: 'hashedPassword123',
    name: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    isEmailVerified: true,
    ...userData,
  } as DeepPartial<ObjectLiteral>[]);
  return await userRepository.save(testUser);
};

export const generateTestToken = (userId: string): string => {
  return `test-token-${userId}`;
};
