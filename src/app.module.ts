import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validateEnv } from '@shared/env.validator';
import dataSource, { initializeDataSource } from '@database/data-source';
import authConfig from '@config/auth.config';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { WaitlistModule } from './modules/waitlist/waitlist.module';
import { MailModule } from './modules/mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      load: [authConfig],
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...dataSource.options,
      }),
      dataSourceFactory: async () => {
        if (!dataSource.isInitialized) {
          await initializeDataSource();
        }
        return dataSource;
      },
    }),
    AuthModule,
    UsersModule,
    WaitlistModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
