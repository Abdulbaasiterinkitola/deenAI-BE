import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { google } from 'googleapis';
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

    if (platform === PaymentPlatform.GOOGLE) {
      transactionData = await this.verifyGooglePurchase(
        verificationData as VerifyGooglePurchaseDto,
      );
    } else {
      transactionData = await this.verifyApplePurchase(
        verificationData as VerifyApplePurchaseDto,
      );
    }

    // 3. Idempotency Check (Duplicate Transaction Prevention)
    if (transactionData.transactionId) {
      const existingTransaction =
        await this.paymentsQueryService.findByTransactionId(
          transactionData.transactionId!,
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
    // Ensure productId exists
    if (!transactionData.productId) {
      throw new CustomHttpException(
        'Invalid transaction data: Product ID is missing',
        HttpStatus.BAD_REQUEST,
      );
    }

    const plan = await this.mapProductToPlan(transactionData.productId!);
    if (!plan) {
      throw new CustomHttpException(
        `Plan not found for product ID: ${transactionData.productId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // 5. Transaction: Create Record & Upgrade User
    // FIX: Allow null here because .create() returns T | null
    let savedTransaction: PaymentTransaction | null = null;

    await this.dataSource.transaction(async (manager) => {
      // A. Create Payment Transaction Record
      savedTransaction = await this.paymentTransactionModelAction.create({
        createPayload: {
          ...transactionData,
          userId,
          planId: plan.id,
          status: PaymentStatus.COMPLETED, // Assuming success if verification passed
        } as any, // Cast to any to avoid Partial vs DeepPartial mismatch in complex types
        transactionOptions: { useTransaction: true, transaction: manager },
      });

      if (!savedTransaction) {
        throw new Error('Failed to create payment transaction record');
      }

      // B. Update User Plan & Billing Info
      // We update the plan, set billing start to now
      await this.usersService.updateUserFields(userId, {
        planId: plan.id,
        billingStart: new Date(),
        currentPeriodStart: new Date(),
      });

      this.logger.log(
        `User ${userId} upgraded to plan ${plan.slug} via ${platform}`,
      );
    });

    if (!savedTransaction) {
      throw new CustomHttpException(
        'Transaction failed to save',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return savedTransaction!;
  }

  /**
   * Google Play Verification Logic
   */
  private async verifyGooglePurchase(
    data: VerifyGooglePurchaseDto,
  ): Promise<Partial<PaymentTransaction>> {
    try {
      const serviceAccountJson = this.configService.get<string>(
        'payment.google.serviceAccountJson',
      );
      const packageName = 'com.deenai.app'; // Should be in config

      if (!serviceAccountJson) {
        throw new Error('Google Service Account JSON not configured');
      }

      // Initialize Google Auth
      const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(serviceAccountJson),
        scopes: ['https://www.googleapis.com/auth/androidpublisher'],
      });

      const androidPublisher = google.androidpublisher({
        version: 'v3',
        auth,
      });

      // Verify Subscription
      const response = await androidPublisher.purchases.subscriptions.get({
        packageName,
        subscriptionId: data.productId,
        token: data.purchaseToken,
      });

      const purchase = response.data;

      // Check if valid
      if (!purchase.orderId) {
        throw new CustomHttpException(
          'Invalid purchase order ID from Google',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Determine expiration
      const expirationDate = purchase.expiryTimeMillis
        ? new Date(Number(purchase.expiryTimeMillis))
        : null;

      return {
        platform: PaymentPlatform.GOOGLE,
        transactionId: purchase.orderId,
        productId: data.productId,
        purchaseDate: new Date(Number(purchase.startTimeMillis)),
        expirationDate,
        originalTransactionId: purchase.linkedPurchaseToken || null, // Best effort for original ID
        isTrialPeriod: purchase.paymentState === 2, // 2 = Free Trial
        isIntroductoryPricePeriod: false, // Logic depends on priceAmountMicros vs standard
        rawResponse: purchase as any,
      };
    } catch (error) {
      this.logger.error('Google verification failed', error);
      // In dev/test, if no credentials, you might want to throw a mock error or return a mock success depending on strictness
      if (process.env.NODE_ENV !== 'production') {
        this.logger.warn('Returning MOCK Google transaction for non-prod');
        return {
          platform: PaymentPlatform.GOOGLE,
          transactionId: `GPA.MOCK-${Date.now()}`,
          productId: data.productId,
          purchaseDate: new Date(),
          expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isTrialPeriod: false,
          isIntroductoryPricePeriod: false,
          rawResponse: { mock: true },
        };
      }
      throw new CustomHttpException(
        'Failed to verify Google purchase',
        HttpStatus.BAD_REQUEST,
      );
    }
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
          // Retry with sandbox URL (common during app review)
          const sandboxResponse = await axios.post(
            'https://sandbox.itunes.apple.com/verifyReceipt',
            {
              'receipt-data': data.receiptData,
              password: sharedSecret,
            },
          );
          if (sandboxResponse.data.status === 0) {
            return this.parseAppleResponse(sandboxResponse.data, data.productId);
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
    // Find the latest receipt info for the specific product
    const latestReceipts = body.latest_receipt_info || body.receipt.in_app;
    // Sort by purchase date descending
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
  private async mapProductToPlan(productId: string) {
    // This mapping logic might need to be more sophisticated or stored in DB
    // For now, we assume product IDs contain the slug or map directly
    // e.g. "com.deenai.premium.monthly" -> "premium-monthly"

    let slug = 'free';
    if (productId.includes('monthly')) slug = 'premium-monthly';
    else if (productId.includes('yearly')) slug = 'premium-yearly';

    return await this.plansService.getBySlug(slug);
  }
}