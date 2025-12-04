import {
  Controller,
  Post,
  Body,
  UseGuards,
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
import { PaymentsDocs } from './docs/payments.doc';
import { AuthUser } from '@guards/auth-user.decorator';
import { User } from '@modules/users/models/user.model';

@PaymentsDocs.tag()
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('verify-google-purchase')
  @PaymentsDocs.verifyGooglePurchase()
  async verifyGooglePurchase(
    @AuthUser() user: User,
    @Body() dto: VerifyGooglePurchaseDto,
  ) {
    const transaction = await this.paymentsService.verifyGooglePurchase(
      user.id,
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
  async verifyApplePurchase(
    @AuthUser() user: User,
    @Body() dto: VerifyApplePurchaseDto,
  ) {
    const transaction = await this.paymentsService.verifyApplePurchase(
      user.id,
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
    @AuthUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const { items, meta } = await this.paymentsService.getUserTransactions(
      user.id,
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
    @AuthUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const transaction = await this.paymentsService.getTransactionById(
      id,
      user.id,
    );
    return {
      success: true,
      message: 'Transaction details retrieved successfully',
      data: transaction,
    };
  }
}