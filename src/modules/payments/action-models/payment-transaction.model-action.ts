import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractModelAction } from '@shared/abstract-model-action';
import { PaymentTransaction } from '../models/payment-transaction.model';

@Injectable()
export class PaymentTransactionModelAction extends AbstractModelAction<PaymentTransaction> {
  constructor(
    @InjectRepository(PaymentTransaction)
    repository: Repository<PaymentTransaction>,
  ) {
    super(repository, PaymentTransaction);
  }
}