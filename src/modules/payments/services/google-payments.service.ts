import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, androidpublisher_v3 } from 'googleapis';
import { CustomHttpException } from '@shared/custom.exception';
import {
  GooglePurchaseResponseDto,
  GooglePurchaseState,
  GoogleConsumptionState,
} from '../dtos/google-purchase-response.dto';
import { VerifyGooglePurchaseDto } from '../dtos/verify-purchase.dto';

type AndroidPublisher = androidpublisher_v3.Androidpublisher;

@Injectable()
export class GooglePaymentsService {
  private readonly logger = new Logger(GooglePaymentsService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Verifies a Google Play purchase (subscription or one-time product)
   */
  async verifyPurchase(
    dto: VerifyGooglePurchaseDto,
  ): Promise<GooglePurchaseResponseDto> {
    const client = this.buildClient();
    const androidPublisher = this.buildPublisher(client);

    this.logger.debug(
      `Verifying Google purchase for product ${dto.productId} in package ${dto.packageName}`,
    );

    // Try subscription first; fallback to one-time product
    const subscription = await this.tryGetSubscription(androidPublisher, dto);
    if (subscription) {
      return this.mapSubscriptionResponse(dto, subscription);
    }

    const product = await this.tryGetProduct(androidPublisher, dto);
    if (product) {
      const response = await this.mapProductResponse(
        dto,
        product,
        androidPublisher,
      );
      return response;
    }

    throw new CustomHttpException(
      'Unable to verify Google purchase',
      HttpStatus.BAD_REQUEST,
    );
  }

  private buildClient() {
    const serviceAccountRaw = this.configService.get<string>(
      'payment.google.serviceAccountJson',
    );

    if (!serviceAccountRaw) {
      throw new CustomHttpException(
        'Google Play credentials missing',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    let credentials;
    try {
      if (!serviceAccountRaw.trim().startsWith('{')) {
        const buffer = Buffer.from(serviceAccountRaw, 'base64');
        credentials = JSON.parse(buffer.toString('utf-8'));
      } else {
        credentials = JSON.parse(serviceAccountRaw);
      }
    } catch (error) {
      this.logger.error('Failed to parse Google service account JSON', error);
      throw new CustomHttpException(
        'Invalid Google Play credentials',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });
  }

  private buildPublisher(
    auth: androidpublisher_v3.Options['auth'],
  ): AndroidPublisher {
    return google.androidpublisher({
      version: 'v3',
      auth,
    });
  }

  private async tryGetSubscription(
    publisher: AndroidPublisher,
    dto: VerifyGooglePurchaseDto,
  ): Promise<androidpublisher_v3.Schema$SubscriptionPurchase | null> {
    try {
      const { data } = await publisher.purchases.subscriptions.get({
        packageName: dto.packageName,
        subscriptionId: dto.productId,
        token: dto.purchaseToken,
      });
      return data ?? null;
    } catch (error) {
      const code = (error as { code?: number }).code;
      if (code === 404) {
        this.logger.debug(
          `Subscription not found for ${dto.productId}, will try product lookup`,
        );
        return null;
      }
      this.logger.error('Google subscription verification failed', error);
      throw new CustomHttpException(
        'Failed to verify Google purchase',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async tryGetProduct(
    publisher: AndroidPublisher,
    dto: VerifyGooglePurchaseDto,
  ): Promise<androidpublisher_v3.Schema$ProductPurchase | null> {
    try {
      const { data } = await publisher.purchases.products.get({
        packageName: dto.packageName,
        productId: dto.productId,
        token: dto.purchaseToken,
      });
      return data ?? null;
    } catch (error) {
      const code = (error as { code?: number }).code;
      if (code === 404) {
        this.logger.error('Google product not found for token', error);
        throw new CustomHttpException(
          'Google purchase not found or invalid token',
          HttpStatus.BAD_REQUEST,
        );
      }
      this.logger.error('Google product verification failed', error);
      throw new CustomHttpException(
        'Failed to verify Google purchase',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private mapSubscriptionResponse(
    dto: VerifyGooglePurchaseDto,
    purchase: androidpublisher_v3.Schema$SubscriptionPurchase,
  ): GooglePurchaseResponseDto {
    const now = Date.now();
    const expirationTime = purchase.expiryTimeMillis
      ? new Date(Number(purchase.expiryTimeMillis))
      : null;

    let state = GooglePurchaseState.PURCHASED;
    if (purchase.cancelReason !== undefined) {
      state = GooglePurchaseState.CANCELED;
    } else if (expirationTime && expirationTime.getTime() < now) {
      state = GooglePurchaseState.EXPIRED;
    } else if (
      purchase.paymentState === 0 ||
      purchase.paymentState === 3 ||
      purchase.purchaseType === 0
    ) {
      state = GooglePurchaseState.PENDING;
    }

    return {
      productId: dto.productId,
      purchaseToken: dto.purchaseToken,
      packageName: dto.packageName,
      state,
      isSubscription: true,
      orderId: purchase.orderId ?? undefined,
      purchaseTime: purchase.startTimeMillis
        ? new Date(Number(purchase.startTimeMillis))
        : null,
      expirationTime,
      acknowledged: purchase.acknowledgementState === 1,
      rawResponse: purchase as Record<string, unknown>,
    };
  }

  private async mapProductResponse(
    dto: VerifyGooglePurchaseDto,
    purchase: androidpublisher_v3.Schema$ProductPurchase,
    publisher: AndroidPublisher,
  ): Promise<GooglePurchaseResponseDto> {
    const purchaseState = purchase.purchaseState ?? 0;
    const consumptionState =
      purchase.consumptionState === 1
        ? GoogleConsumptionState.CONSUMED
        : GoogleConsumptionState.NOT_CONSUMED;

    let state = GooglePurchaseState.PURCHASED;
    if (purchaseState === 1) {
      state = GooglePurchaseState.CANCELED;
    } else if (purchaseState === 2) {
      state = GooglePurchaseState.PENDING;
    }

    if (
      state === GooglePurchaseState.PURCHASED &&
      consumptionState === GoogleConsumptionState.NOT_CONSUMED
    ) {
      await this.consumeProduct(dto, publisher);
    }

    return {
      productId: dto.productId,
      purchaseToken: dto.purchaseToken,
      packageName: dto.packageName,
      state,
      isSubscription: false,
      orderId: purchase.orderId ?? undefined,
      purchaseTime: purchase.purchaseTimeMillis
        ? new Date(Number(purchase.purchaseTimeMillis))
        : null,
      acknowledged: purchase.acknowledgementState === 1,
      consumptionState,
      rawResponse: purchase as Record<string, unknown>,
    };
  }

  private async consumeProduct(
    dto: VerifyGooglePurchaseDto,
    publisher: AndroidPublisher,
  ) {
    try {
      await publisher.purchases.products.consume({
        packageName: dto.packageName,
        productId: dto.productId,
        token: dto.purchaseToken,
      });
      this.logger.debug(
        `Consumed Google product ${dto.productId} for package ${dto.packageName}`,
      );
    } catch (error) {
      // Log but do not block the flow
      this.logger.error('Failed to consume Google product', error);
    }
  }
}
