import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  VerifyPurchaseResponseDto,
  PaginatedTransactionsResponseDto,
  PaymentTransactionResponseDto,
} from '../dtos/payment-response.dto';

export class PaymentsDocs {
  static tag() {
      return ApiTags('Payments');
  }

  static verifyGooglePurchase() {
    return applyDecorators(
      ApiOperation({
        summary: 'Verify Google Play purchase',
        description: 'Verifies a purchase token from Google Play and upgrades the user plan.',
      }),
      ApiResponse({
        status: 201,
        description: 'Purchase verified successfully',
        type: VerifyPurchaseResponseDto,
      }),
    );
  }

  static verifyApplePurchase() {
    return applyDecorators(
      ApiOperation({
        summary: 'Verify Apple App Store purchase',
        description: 'Verifies a receipt from Apple App Store and upgrades the user plan.',
      }),
      ApiResponse({
        status: 201,
        description: 'Purchase verified successfully',
        type: VerifyPurchaseResponseDto,
      }),
    );
  }

  static getUserTransactions() {
    return applyDecorators(
      ApiOperation({
        summary: 'Get payment history',
        description: 'Retrieve paginated list of past transactions for the authenticated user.',
      }),
      ApiQuery({ name: 'page', required: false, example: 1 }),
      ApiQuery({ name: 'limit', required: false, example: 10 }),
      ApiResponse({
        status: 200,
        type: PaginatedTransactionsResponseDto,
      }),
    );
  }

  static getTransactionById() {
    return applyDecorators(
      ApiOperation({
        summary: 'Get transaction details',
        description: 'Retrieve detailed information about a specific transaction.',
      }),
      ApiParam({ name: 'id', description: 'Transaction UUID' }),
      ApiResponse({
        status: 200,
        type: PaymentTransactionResponseDto,
      }),
    );
  }
}