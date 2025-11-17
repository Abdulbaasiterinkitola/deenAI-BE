import { Module } from '@nestjs/common';
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
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>('REDIS_HOST') || '127.0.0.1',
          port: Number(config.get<number>('REDIS_PORT') ?? 6379),
        },
      }),
    }),
    BullModule.registerQueue({ name: 'email' }),
  ],
  controllers: [EmailServiceController],
  providers: [EmailService, ProcessMail],
  exports: [EmailService],
})
export class EmailServiceModule {}
