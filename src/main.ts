import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { initializeDataSource } from '@database/data-source';
import { ResponseInterceptor } from '@shared/response.interceptor';
import { ValidationPipe } from '@shared/validator.pipe';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationExceptionFilter } from '@shared/validation-exception.filter';
import { seedPlans } from '@database/seeds/seed-plans';
import { seedSuperadmin } from '@database/seeds/seed-superadmin';
import { join } from 'path';

async function bootstrap() {
  // Handle uncaught Redis connection errors gracefully (only log, no crash)
  process.on('unhandledRejection', (reason: any) => {
    const isRedisError =
      (reason?.code === 'ECONNREFUSED' && reason?.port === 6379) ||
      reason?.errors?.some?.(
        (e: any) => e?.code === 'ECONNREFUSED' && e?.port === 6379,
      );

    if (isRedisError) {
      const logger = new Logger('Bootstrap');
      logger.error(
        'Redis connection refused. Email queue will be unavailable. Emails will be sent directly.',
      );
      return;
    }
    const logger = new Logger('Bootstrap');
    logger.error('Unhandled Rejection:', reason);
  });

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  const logger = new Logger('Bootstrap');

  // Initialize database connection
  try {
    await initializeDataSource();
    logger.log('Data Source has been initialized!');

    try {
      await seedPlans();
      await seedSuperadmin();
      logger.log('Database seeding completed!');
    } catch (seedError) {
      logger.error('Error during database seeding', seedError);
    }
  } catch (err) {
    console.error('Error during Data Source initialization', err);
    process.exit(1);
  }

  // Global configuration
  app.enable('trust proxy');
  app.enableCors();
  app.setGlobalPrefix('api/v1', {
    exclude: ['/', 'health', 'api', 'api/v1', 'api/docs', 'probe'],
  });

  // Global pipes, interceptors, and filters
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new ValidationExceptionFilter());

  // Serve uploads folder statically
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('DeenAI API Documentation')
    .setDescription('DeenAI Backend API Documentation')
    .setVersion('1.0')
    .addTag('App')
    // Core endpoints
    .addTag('Health')
    .addTag('Authentication')
    .addTag('Users')
    .addTag('Profile')
    .addTag('Subscriptions')
    .addTag('Payments')
    .addTag('Plans')
    // Main features
    .addTag('Chats')
    .addTag('Reflections')
    .addTag('Bookmarks')
    .addTag('Notification Settings')
    .addTag('Streaks')
    .addTag('Reciters')
    .addTag('Collections')
    // Superadmin endpoints (grouped together)
    .addTag('Superadmin Users Management')
    .addTag('Superadmin Stats')
    .addTag('Superadmin AI Stats')
    .addTag('Superadmin Notifications')
    // Public/Support endpoints (at the end)
    .addTag('Contact')
    .addTag('Feedback')
    .addTag('Newsletter')
    .addTag('Waitlist')
    .addTag('Squeeze')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT ?? 4001;
  await app.listen(port);
  logger.log(`Application is running on port ${port}`);
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
