import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import paymentConfig from '@config/payment.config';

import { PaymentTransaction } from './models/payment-transaction.model';
import { PaymentTransactionModelAction } from './action-models/payment-transaction.model-action';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentsCoreService } from './services/payments-core.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentTransaction]),
    ConfigModule.forFeature(paymentConfig),
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PaymentsCoreService,
    PaymentTransactionModelAction,
  ],
  exports: [PaymentsService, PaymentTransactionModelAction],
})
export class PaymentsModule {}