import { Injectable } from '@nestjs/common';
import { PaymentsCoreService } from './services/payments-core.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly paymentsCoreService: PaymentsCoreService) {}

  // Facade methods for controller
}
