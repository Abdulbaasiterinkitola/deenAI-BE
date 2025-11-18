import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { EmailServiceController } from './email.controller';
import { ProcessMail } from './email.processor';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const logger = new Logger('BullModule');
        const redisHost = config.get<string>('REDIS_HOST') || '127.0.0.1';
        const redisPort = Number(config.get<number>('REDIS_PORT') ?? 6379);

        logger.log(
          `Configuring Bull with Redis at ${redisHost}:${redisPort} (redis container)`,
        );
        logger.log(
          `Make sure redis container is running: docker ps | grep redis`,
        );

        return {
          redis: {
            host: redisHost,
            port: redisPort,
            connectTimeout: 10000, // 10s timeout
            retryStrategy: (times: number) => {
              // Retry with exponential backoff
              if (times > 3) {
                logger.warn(`Redis connection failed after ${times} attempts.`);
                return null; // Stop retrying after 3 attempts
              }
              const delay = Math.min(times * 1000, 3000);
              logger.log(
                `Retrying Redis connection (attempt ${times}) in ${delay}ms...`,
              );
              return delay;
            },
            lazyConnect: false, // Connect immediately to verify connection
            showFriendlyErrorStack: true,
          },
          settings: {
            stalledInterval: 30000,
            maxStalledCount: 1,
          },
        };
      },
    }),
    BullModule.registerQueue({
      name: 'email',
      // Don't fail module initialization if queue can't be created
    }),
  ],
  controllers: [EmailServiceController],
  providers: [EmailService, ProcessMail],
  exports: [EmailService, ProcessMail],
})
export class EmailServiceModule {}
