import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { initializeDataSource } from '@database/data-source';
import { ResponseInterceptor } from '@shared/response.interceptor';
import { ValidationPipe } from '@shared/validator.pipe';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationExceptionFilter } from '@shared/validation-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  const logger = new Logger('Bootstrap');

  // Initialize database connection
  try {
    await initializeDataSource();
    logger.log('Data Source has been initialized!');
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

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('NoorAI API Documentation')
    .setDescription('NoorAI Backend API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(app, config),
  );

  const port = process.env.PORT ?? 4001;
  await app.listen(port);
  logger.log(`Application is running on port ${port}`);
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
