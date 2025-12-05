import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import axios from 'axios';

import { PaymentTransactionModelAction } from '../action-models/payment-transaction.model-action';
import { PaymentsValidationService } from './payments-validation.service';
import { UsersService } from '@modules/users/users.service';
import { PlansService } from '@modules/plans/plans.service';
import { PaymentPlatform, PaymentStatus } from '../enums/payment.enums';
import {
  VerifyGooglePurchaseDto,
  VerifyApplePurchaseDto,
} from '../dtos/verify-purchase.dto';
import { PaymentTransaction } from '../models/payment-transaction.model';
import { CustomHttpException } from '@shared/custom.exception';
import { PaymentsQueryService } from './payments-query.service';
import { GooglePaymentsService } from './google-payments.service';
import {
  GooglePurchaseState,
  GooglePurchaseResponseDto,
} from '../dtos/google-purchase-response.dto';

@Injectable()
export class PaymentsCoreService {
  private readonly logger = new Logger(PaymentsCoreService.name);

  constructor(
    private readonly paymentTransactionModelAction: PaymentTransactionModelAction,
    private readonly paymentsQueryService: PaymentsQueryService,
    private readonly paymentsValidationService: PaymentsValidationService,
    private readonly usersService: UsersService,
    private readonly plansService: PlansService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    private readonly googlePaymentsService: GooglePaymentsService,
  ) {}

  /**
   * Main entry point to verify and process a purchase from any platform
   */
  async verifyAndProcessPurchase(
    platform: PaymentPlatform,
    userId: string,
    verificationData: VerifyGooglePurchaseDto | VerifyApplePurchaseDto,
  ): Promise<PaymentTransaction> {
    // 1. Validate User
    await this.paymentsValidationService.validateUserExists(userId);

    // 2. Platform Specific Verification
    let transactionData: Partial<PaymentTransaction>;
    let googleVerification: GooglePurchaseResponseDto | null = null;

    if (platform === PaymentPlatform.GOOGLE) {
      googleVerification = await this.googlePaymentsService.verifyPurchase(
        verificationData as VerifyGooglePurchaseDto,
      );
      transactionData =
        this.mapGoogleVerificationToTransaction(googleVerification);
    } else {
      transactionData = await this.verifyApplePurchase(
        verificationData as VerifyApplePurchaseDto,
      );
    }

    // 3. Idempotency Check (Duplicate Transaction Prevention)
    if (transactionData.transactionId) {
      const existingTransaction =
        await this.paymentsQueryService.findByTransactionId(
          transactionData.transactionId,
        );

      if (existingTransaction) {
        this.logger.log(
          `Duplicate transaction detected: ${transactionData.transactionId}. Returning existing record.`,
        );
        // If it belongs to a different user, that's a security issue (receipt sharing)
        if (existingTransaction.userId !== userId) {
          throw new CustomHttpException(
            'This receipt has already been used by another account.',
            HttpStatus.CONFLICT,
          );
        }
        return existingTransaction;
      }
    }

    // 4. Map Product ID to Internal Plan
    if (!transactionData.productId) {
      throw new CustomHttpException(
        'Invalid transaction data: Product ID is missing',
        HttpStatus.BAD_REQUEST,
      );
    }

    const plan = await this.mapProductToPlan(
      transactionData.productId,
      'planId' in verificationData ? verificationData.planId : undefined,
    );
    if (!plan) {
      throw new CustomHttpException(
        `Plan not found for product ID: ${transactionData.productId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const targetStatus =
      googleVerification?.state === GooglePurchaseState.PENDING
        ? PaymentStatus.PENDING
        : googleVerification?.state === GooglePurchaseState.CANCELED
          ? PaymentStatus.CANCELLED
          : googleVerification?.state === GooglePurchaseState.EXPIRED
            ? PaymentStatus.FAILED
            : PaymentStatus.COMPLETED;

    if (googleVerification?.state === GooglePurchaseState.PENDING) {
      return (await this.paymentTransactionModelAction.create({
        createPayload: {
          ...transactionData,
          userId,
          planId: plan.id,
          status: targetStatus,
        },
      })) as PaymentTransaction;
    }

    if (
      googleVerification?.state === GooglePurchaseState.CANCELED ||
      googleVerification?.state === GooglePurchaseState.EXPIRED
    ) {
      throw new CustomHttpException(
        'Google purchase is not active.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 5. Transaction: Create Record & Upgrade User Atomically
    return await this.dataSource.transaction(async (manager) => {
      // A. Create Payment Transaction Record
      const savedTransaction = await this.paymentTransactionModelAction.create({
        createPayload: {
          ...transactionData,
          userId,
          planId: plan.id,
          status: targetStatus,
        },
        transactionOptions: { useTransaction: true, transaction: manager },
      });

      if (!savedTransaction) {
        throw new CustomHttpException(
          'Failed to create payment transaction record',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // B. Update User Plan & Billing Info within the same transaction
      await this.usersService.updateUserPlanWithTransaction(
        userId,
        plan.id,
        manager,
      );

      this.logger.log(
        `User ${userId} upgraded to plan ${plan.slug} via ${platform}`,
      );

      return savedTransaction;
    });
  }

  private mapGoogleVerificationToTransaction(
    verification: GooglePurchaseResponseDto,
  ): Partial<PaymentTransaction> {
    return {
      platform: PaymentPlatform.GOOGLE,
      transactionId: verification.orderId ?? undefined,
      productId: verification.productId,
      purchaseDate: verification.purchaseTime ?? new Date(),
      expirationDate: verification.expirationTime ?? null,
      originalTransactionId: undefined,
      isTrialPeriod: false,
      isIntroductoryPricePeriod: false,
      rawResponse: verification.rawResponse as any,
    };
  }

  /**
   * Apple App Store Verification Logic
   */
  private async verifyApplePurchase(
    data: VerifyApplePurchaseDto,
  ): Promise<Partial<PaymentTransaction>> {
    try {
      const sharedSecret = this.configService.get<string>(
        'payment.apple.sharedSecret',
      );
      const environment = this.configService.get<string>(
        'payment.apple.environment',
      );
      const verifyUrl =
        environment === 'Production'
          ? 'https://buy.itunes.apple.com/verifyReceipt'
          : 'https://sandbox.itunes.apple.com/verifyReceipt';

      const response = await axios.post(verifyUrl, {
        'receipt-data': data.receiptData,
        password: sharedSecret,
        'exclude-old-transactions': true,
      });

      const body = response.data;

      if (body.status !== 0) {
        // Status 21007 means receipt is Sandbox but sent to Prod URL
        if (body.status === 21007 && environment === 'Production') {
          const sandboxResponse = await axios.post(
            'https://sandbox.itunes.apple.com/verifyReceipt',
            {
              'receipt-data': data.receiptData,
              password: sharedSecret,
            },
          );
          if (sandboxResponse.data.status === 0) {
            return this.parseAppleResponse(
              sandboxResponse.data,
              data.productId,
            );
          }
        }
        throw new Error(`Apple receipt status: ${body.status}`);
      }

      return this.parseAppleResponse(body, data.productId);
    } catch (error) {
      this.logger.error('Apple verification failed', error);
      if (process.env.NODE_ENV !== 'production') {
        this.logger.warn('Returning MOCK Apple transaction for non-prod');
        return {
          platform: PaymentPlatform.APPLE,
          transactionId: `1000000${Date.now()}`,
          productId: data.productId,
          purchaseDate: new Date(),
          expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isTrialPeriod: false,
          isIntroductoryPricePeriod: false,
          rawResponse: { mock: true },
        };
      }
      throw new CustomHttpException(
        'Failed to verify Apple purchase',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private parseAppleResponse(
    body: any,
    targetProductId: string,
  ): Partial<PaymentTransaction> {
    const latestReceipts = body.latest_receipt_info || body.receipt.in_app;
    const sorted = latestReceipts.sort(
      (a, b) => Number(b.purchase_date_ms) - Number(a.purchase_date_ms),
    );
    const transaction = sorted.find((t) => t.product_id === targetProductId);

    if (!transaction) {
      throw new Error('Product ID not found in receipt');
    }

    return {
      platform: PaymentPlatform.APPLE,
      transactionId: transaction.transaction_id,
      originalTransactionId: transaction.original_transaction_id,
      productId: transaction.product_id,
      purchaseDate: new Date(Number(transaction.purchase_date_ms)),
      expirationDate: transaction.expires_date_ms
        ? new Date(Number(transaction.expires_date_ms))
        : null,
      isTrialPeriod: transaction.is_trial_period === 'true',
      isIntroductoryPricePeriod:
        transaction.is_in_intro_offer_period === 'true',
      rawResponse: body,
    };
  }

  /**
   * Helper to map store product IDs to internal Plan entities
   */
  private async mapProductToPlan(productId: string, planId?: string) {
    if (planId) {
      return this.plansService.getById(planId);
    }

    const lowerId = productId.toLowerCase();
    let slug = 'free';

    const ID_MAP: Record<string, string> = {
      'com.deenai.premium.monthly': 'premium-monthly',
      'com.deenai.premium.yearly': 'premium-yearly',
      premium_monthly: 'premium-monthly',
      premium_yearly: 'premium-yearly',
    };

    if (ID_MAP[productId]) {
      slug = ID_MAP[productId];
    } else if (lowerId.includes('monthly')) {
      slug = 'premium-monthly';
    } else if (lowerId.includes('yearly')) {
      slug = 'premium-yearly';
    }

    const plan = await this.plansService.getBySlug(slug);

    if (!plan) {
      this.logger.error(
        `Critical: Plan slug '${slug}' mapped from product '${productId}' not found in DB.`,
      );
    }

    return plan;
  }
}
