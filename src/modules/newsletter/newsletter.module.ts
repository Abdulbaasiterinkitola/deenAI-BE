import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';
import { NewsletterModelAction } from './newsletter.model-action';
import { NewsletterSubscription } from './models/newsletter-subscription.model';
import { UsersModule } from '@modules/users/users.module';
import { EmailServiceModule } from '@modules/email/email.module';
import { AuthModule } from '@modules/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NewsletterSubscription]),
    UsersModule,
    EmailServiceModule,
    AuthModule,
  ],
  controllers: [NewsletterController],
  providers: [NewsletterService, NewsletterModelAction],
  exports: [NewsletterService],
})
export class NewsletterModule {}
