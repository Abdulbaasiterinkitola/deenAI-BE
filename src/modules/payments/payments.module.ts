import { Module } from '@nestjs/common';
import { PaymentsWebhookController } from './payments-webhook.controller';
import { PaymentsAdminController } from './payments-admin.controller';
import { PaymentsWebhookService } from './services/payments-webhook.service';
import { SubscriptionsModule } from '@modules/subscriptions/subscriptions.module';
import { UsersModule } from '@modules/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookLog } from './models/webhook-log.model';
import { PaymentTransaction } from './models/payment-transaction.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([WebhookLog, PaymentTransaction]),
    SubscriptionsModule,
    UsersModule,
  ],
  controllers: [PaymentsWebhookController, PaymentsAdminController],
  providers: [PaymentsWebhookService],
  exports: [PaymentsWebhookService],
})
export class PaymentsModule { }
