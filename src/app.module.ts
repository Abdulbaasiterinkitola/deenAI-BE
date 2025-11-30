import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
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
import { ProfileModule } from '@modules/profile/profile.module';
import { HealthModule } from '@modules/health/health.module';
import { NotificationSettingsModule } from '@modules/notification-settings/notification-settings.module';
import { ContactModule } from '@modules/contact/contact.module';
import { ChatsModule } from '@modules/chats/chats.module';
import { BookmarksModule } from '@modules/bookmarks/bookmarks.module';
import { PlansModule } from '@modules/plans/plans.module';
import { ScheduleModule } from '@nestjs/schedule';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { SubscriptionsModule } from '@modules/subscriptions/subscriptions.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/guards/auth.guard';
import { SqueezeModule } from '@modules/squeeze/squeeze.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      load: [authConfig],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          url: configService.get<string>('REDIS_URL'),
          ttl: 60 * 1000, // Default TTL of 1 minute
        }),
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
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
    ProfileModule,
    HealthModule,
    NotificationSettingsModule,
    ContactModule,
    ChatsModule,
    BookmarksModule,
    PlansModule,
    SubscriptionsModule,
    FeedbackModule,
    SqueezeModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
