import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { AppModule } from '../src/app.module';
import { ResponseInterceptor } from '@shared/response.interceptor';
import { ValidationExceptionFilter } from '@shared/validation-exception.filter';

// Mock all email-related services
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  }),
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
    // Suppress unhandled promise rejections during tests
    process.removeAllListeners('unhandledRejection');
    process.on('unhandledRejection', () => {});
    
    // Suppress console logs during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .setLogger({
        log: () => {},
        error: () => {},
        warn: () => {},
        debug: () => {},
        verbose: () => {},
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
      const entities = this.dataSource.entityMetadatas;
      
      await this.dataSource.query('SET session_replication_role = replica;');
      
      for (let i = entities.length - 1; i >= 0; i--) {
        const entity = entities[i];
        await this.dataSource.query(`TRUNCATE TABLE "${entity.tableName}" RESTART IDENTITY CASCADE;`);
      }
      
      await this.dataSource.query('SET session_replication_role = DEFAULT;');
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

export const createTestUser = async (dataSource: DataSource, userData: any = {}) => {
  const userRepository = dataSource.getRepository('User');
  const testUser = userRepository.create({
    email: 'test@example.com',
    password: 'hashedPassword123',
    name: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    isEmailVerified: true,
    ...userData,
  });
  return await userRepository.save(testUser);
};

export const generateTestToken = (userId: string): string => {
  return `test-token-${userId}`;
};