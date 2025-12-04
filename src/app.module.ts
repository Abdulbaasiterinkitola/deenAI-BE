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
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerConfigService } from './config/throttler.config';
import { ThrottlerBehindProxyGuard } from './guards/throttler-behind-proxy.guard';
import { SqueezeModule } from '@modules/squeeze/squeeze.module';
import { RecitersModule } from './modules/reciters/reciters.module';
import { NewsletterModule } from '@modules/newsletter/newsletter.module';
import { SuperadminModule } from '@modules/superadmin/superadmin.module';
import { CollectionModule } from '@modules/collection/collection.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      load: [authConfig],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useClass: ThrottlerConfigService,
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
    RecitersModule,
    NewsletterModule,
    SuperadminModule,
    CollectionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: AuthGuard },
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
  ],
})
export class AppModule {}
