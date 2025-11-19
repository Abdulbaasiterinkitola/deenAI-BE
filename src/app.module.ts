import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validateEnv } from '@shared/env.validator';
import dataSource, { initializeDataSource } from '@database/data-source';
import authConfig from '@config/auth.config';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { EmailServiceModule } from '@modules/email/email.module';
import { WaitlistModule } from '@modules/waitlist/waitlist.module';
import { ReflectionsModule } from '@modules/reflections/reflections.module';
import { HealthModule } from '@modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      load: [authConfig],
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
    EmailServiceModule,
    WaitlistModule,
    ReflectionsModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
