import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import paymentConfig from '@config/payment.config';

import { PaymentTransaction } from './models/payment-transaction.model';
import { PaymentTransactionModelAction } from './action-models/payment-transaction.model-action';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentsCoreService } from './services/payments-core.service';
import { PaymentsQueryService } from './services/payments-query.service';
import { PaymentsValidationService } from './services/payments-validation.service';

import { UsersModule } from '@modules/users/users.module';
import { PlansModule } from '@modules/plans/plans.module';
import { AuthModule } from '@modules/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentTransaction]),
    ConfigModule.forFeature(paymentConfig),
    forwardRef(() => UsersModule),
    PlansModule,
    AuthModule,
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PaymentsCoreService,
    PaymentsQueryService,
    PaymentsValidationService,
    PaymentTransactionModelAction,
  ],
  exports: [PaymentsService, PaymentTransactionModelAction],
})
export class PaymentsModule {}
