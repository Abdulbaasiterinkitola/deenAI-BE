import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Query,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@guards/auth.guard';
import { PaymentsService } from './payments.service';
import {
  VerifyGooglePurchaseDto,
  VerifyApplePurchaseDto,
} from './dtos/verify-purchase.dto';
import {
  VerifyPurchaseResponseDto,
  PaginatedTransactionsResponseDto,
  PaymentTransactionResponseDto,
} from './dtos/payment-response.dto';
import { PaginationMetaDto } from '@shared/dtos/pagination-meta.dto';
import { PaymentsDocs } from './docs/payments.doc';

@PaymentsDocs.tag()
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('verify-google-purchase')
  @PaymentsDocs.verifyGooglePurchase()
  async verifyGooglePurchase(@Req() req: any, @Body() dto: VerifyGooglePurchaseDto) {
    const transaction = await this.paymentsService.verifyGooglePurchase(
      req.user.id,
      dto,
    );
    return {
      success: true,
      message: 'Purchase verified and processed successfully',
      data: transaction,
    };
  }

  @Post('verify-apple-purchase')
  @PaymentsDocs.verifyApplePurchase()
  async verifyApplePurchase(@Req() req: any, @Body() dto: VerifyApplePurchaseDto) {
    const transaction = await this.paymentsService.verifyApplePurchase(
      req.user.id,
      dto,
    );
    return {
      success: true,
      message: 'Purchase verified and processed successfully',
      data: transaction,
    };
  }

  @Get('transactions')
  @PaymentsDocs.getUserTransactions()
  async getUserTransactions(
    @Req() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const { items, meta } = await this.paymentsService.getUserTransactions(
      req.user.id,
      page,
      limit,
    );
    return {
      success: true,
      message: 'Transactions retrieved successfully',
      data: { items },
      meta,
    };
  }

  @Get('transactions/:id')
  @PaymentsDocs.getTransactionById()
  async getTransactionById(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const transaction = await this.paymentsService.getTransactionById(
      id,
      req.user.id,
    );
    return {
      success: true,
      message: 'Transaction details retrieved successfully',
      data: transaction,
    };
  }
}