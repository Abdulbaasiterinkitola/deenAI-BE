import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookLog } from './models/webhook-log.model';
import { PaymentTransaction } from './models/payment-transaction.model';

@ApiTags('Payments Admin')
@Controller('admin/payments')
export class PaymentsAdminController {
  constructor(
    @InjectRepository(WebhookLog)
    private readonly logRepository: Repository<WebhookLog>,
    @InjectRepository(PaymentTransaction)
    private readonly transactionRepository: Repository<PaymentTransaction>,
  ) {}

  @Get('webhooks')
  @ApiOperation({ summary: 'Get Webhook Logs' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getWebhookLogs(
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
  ) {
    const [logs, count] = await this.logRepository.findAndCount({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      data: logs,
      total: count,
      limit,
      offset,
    };
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get Payment Transactions' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getTransactions(
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
  ) {
    const [transactions, count] = await this.transactionRepository.findAndCount(
      {
        order: { createdAt: 'DESC' },
        take: limit,
        skip: offset,
      },
    );

    return {
      data: transactions,
      total: count,
      limit,
      offset,
    };
  }
}
