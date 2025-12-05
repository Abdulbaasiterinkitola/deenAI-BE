import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { SubscriptionsService } from '@modules/subscriptions/subscriptions.service';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookLog } from '../models/webhook-log.model';
import { PaymentTransaction } from '../models/payment-transaction.model';
import * as crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class PaymentsWebhookService {
    private readonly logger = new Logger(PaymentsWebhookService.name);

    constructor(
        private readonly subscriptionsService: SubscriptionsService,
        private readonly configService: ConfigService,
        @InjectRepository(WebhookLog)
        private readonly logRepository: Repository<WebhookLog>,
        @InjectRepository(PaymentTransaction)
        private readonly transactionRepository: Repository<PaymentTransaction>,
    ) { }

    private async logEvent(provider: string, type: string, payload: any, userId?: string, status: string = 'received') {
        try {
            await this.logRepository.save({
                provider,
                eventType: type,
                payload: JSON.stringify(payload),
                userId,
                status,
            });
        } catch (e) {
            this.logger.error(`Failed to save webhook log: ${e.message}`);
        }
    }

    private async recordTransaction(
        userId: string,
        provider: string,
        transactionId: string,
        type: string,
        status: string,
        rawResponse: any,
        amount?: number,
        currency?: string,
    ) {
        try {
            const existing = await this.transactionRepository.findOne({ where: { transactionId } });
            if (existing) {
                this.logger.log(`Transaction ${transactionId} already recorded`);
                return;
            }

            await this.transactionRepository.save({
                userId,
                provider,
                transactionId,
                type,
                status,
                rawResponse: JSON.stringify(rawResponse),
                amount,
                currency,
            });
        } catch (e) {
            this.logger.error(`Failed to record transaction: ${e.message}`);
        }
    }

    async processGoogleWebhook(payload: any) {
        this.logger.log('Processing Google Webhook');

        if (!payload.message || !payload.message.data) {
            this.logger.warn('Invalid Google Webhook Payload');
            return;
        }

        const decodedData = Buffer.from(payload.message.data, 'base64').toString('utf-8');
        const notification = JSON.parse(decodedData);

        const type = notification.subscriptionNotification?.notificationType;
        const purchaseToken = notification.subscriptionNotification?.purchaseToken;
        const subscriptionId = notification.subscriptionNotification?.subscriptionId;

        let userId: string | undefined;
        if (purchaseToken) {
            const user = await this.subscriptionsService.getUserByGoogleToken(purchaseToken);
            userId = user?.id;
        }

        this.logger.log(`Google Notification Type: ${type}`);
        await this.logEvent('google', String(type), notification, userId);

        if (!userId) {
            this.logger.warn('Could not extract userId from Google notification');
            return;
        }

        switch (type) {
            case 2: // RENEWED
            case 4: // PURCHASED
            case 7: // RESTARTED
                if (subscriptionId) {
                    const plan = await this.subscriptionsService.getPlanByProductId('google', subscriptionId);
                    if (plan) {
                        await this.subscriptionsService.changePlan(userId, plan.id);
                        await this.recordTransaction(userId, 'google', purchaseToken, 'PURCHASE', 'COMPLETED', notification);
                    } else {
                        this.logger.warn(`Plan not found for Google Product ID: ${subscriptionId}`);
                    }
                } else {
                    this.logger.warn('Missing subscriptionId in Google notification');
                }
                break;

            case 3: // CANCELED
            case 12: // REVOKED
            case 13: // EXPIRED
                await this.subscriptionsService.cancelSubscription(userId);
                await this.recordTransaction(userId, 'google', purchaseToken, 'CANCEL', 'COMPLETED', notification);
                break;

            case 5: // ON_HOLD
            case 6: // IN_GRACE_PERIOD
            case 10: // PAUSED
                this.logger.log(`Subscription status change: ${type}`);
                break;

            default:
                this.logger.log(`Unhandled Google Notification Type: ${type}`);
        }
    }

    async processAppleWebhook(payload: any) {
        this.logger.log('Processing Apple Webhook');

        const signedPayload = payload.signedPayload;
        if (!signedPayload) {
            this.logger.warn('Invalid Apple Webhook Payload: Missing signedPayload');
            return;
        }

        const parts = signedPayload.split('.');
        if (parts.length !== 3) {
            this.logger.warn('Invalid JWS format');
            return;
        }

        const payloadBuffer = Buffer.from(parts[1], 'base64');
        const decodedPayload = JSON.parse(payloadBuffer.toString());

        const notificationType = decodedPayload.notificationType;
        const subtype = decodedPayload.subtype;
        const data = decodedPayload.data;
        const originalTransactionId = data?.originalTransactionId;
        const transactionId = data?.transactionId;
        const productId = data?.productId;

        let userId = data?.appAccountToken; // Try appAccountToken first

        if (!userId && originalTransactionId) {
            const user = await this.subscriptionsService.getUserByAppleId(originalTransactionId);
            userId = user?.id;
        }

        this.logger.log(`Apple Notification: ${notificationType} - ${subtype}`);
        await this.logEvent('apple', `${notificationType}:${subtype}`, decodedPayload, userId);

        if (!userId) {
            this.logger.warn('Could not extract userId (appAccountToken) from Apple notification');
            return;
        }

        switch (notificationType) {
            case 'SUBSCRIBED':
            case 'DID_RENEW':
                if (productId) {
                    const plan = await this.subscriptionsService.getPlanByProductId('apple', productId);
                    if (plan) {
                        await this.subscriptionsService.changePlan(userId, plan.id);
                        await this.recordTransaction(userId, 'apple', transactionId || originalTransactionId, 'PURCHASE', 'COMPLETED', decodedPayload);
                    } else {
                        this.logger.warn(`Plan not found for Apple Product ID: ${productId}`);
                    }
                } else {
                    this.logger.warn('Missing productId in Apple notification');
                }
                break;

            case 'DID_FAIL_TO_RENEW':
            case 'EXPIRED':
            case 'REVOKED':
            case 'REFUND':
                await this.subscriptionsService.cancelSubscription(userId);
                await this.recordTransaction(userId, 'apple', transactionId || originalTransactionId, 'CANCEL', 'COMPLETED', decodedPayload);
                break;

            case 'GRACE_PERIOD_EXPIRED':
            case 'PRICE_INCREASE':
                this.logger.log(`Apple event handled: ${notificationType}`);
                break;

            default:
                this.logger.log(`Unhandled Apple Notification Type: ${notificationType}`);
        }
    }

    async verifyGoogleSignature(authHeader: string) {
        if (this.configService.get<string>('SKIP_WEBHOOK_VERIFICATION') === 'true') {
            this.logger.warn('Skipping Google signature verification (Dev Mode)');
            return;
        }

        if (!authHeader) {
            throw new UnauthorizedException('Missing Authorization header');
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new UnauthorizedException('Invalid Authorization header format');
        }

        // Check for local public key first (for dev/testing)
        const localPublicKey = this.configService.get<string>('GOOGLE_PLAY_PUBLIC_KEY');
        if (localPublicKey) {
            try {
                const decodedKey = Buffer.from(localPublicKey, 'base64').toString('utf-8');
                jwt.verify(token, decodedKey, { algorithms: ['RS256'] });
                return;
            } catch (error) {
                this.logger.error(`Google local signature verification failed: ${error.message}`);
                throw new UnauthorizedException('Invalid Google Signature (Local)');
            }
        }

        try {
            const client = new OAuth2Client();
            await client.verifyIdToken({
                idToken: token,
                audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
            });
        } catch (error) {
            this.logger.error(`Google signature verification failed: ${error.message}`);
            throw new UnauthorizedException('Invalid Google Signature');
        }
    }

    async verifyAppleSignature(payload: any) {
        if (this.configService.get<string>('SKIP_WEBHOOK_VERIFICATION') === 'true') {
            this.logger.warn('Skipping Apple signature verification (Dev Mode)');
            return;
        }

        const signedPayload = payload.signedPayload;
        if (!signedPayload) {
            throw new UnauthorizedException('Missing signedPayload');
        }

        try {
            const decoded = jwt.decode(signedPayload, { complete: true }) as any;
            if (!decoded || !decoded.header || !decoded.header.x5c) {
                throw new UnauthorizedException('Invalid JWS: Missing x5c header');
            }

            const x5c = decoded.header.x5c;
            const publicKey = `-----BEGIN CERTIFICATE-----\n${x5c[0]}\n-----END CERTIFICATE-----`;

            jwt.verify(signedPayload, publicKey, { algorithms: ['ES256'] });
        } catch (error) {
            this.logger.error(`Apple signature verification failed: ${error.message}`);
            throw new UnauthorizedException('Invalid Apple Signature');
        }
    }
}
