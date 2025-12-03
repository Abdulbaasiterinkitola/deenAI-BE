import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceToken } from './entities/device-token.entity';
import { User } from '../users/models/user.model';

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);

  constructor(
    @InjectRepository(DeviceToken)
    private readonly deviceTokenRepository: Repository<DeviceToken>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async saveDeviceToken(userId: string, token: string, platform: 'ios' | 'android' | 'web'): Promise<DeviceToken> {
    let deviceToken = await this.deviceTokenRepository.findOne({
      where: { token },
    });

    if (!deviceToken) {
      deviceToken = this.deviceTokenRepository.create({
        userId,
        token,
        platform,
        isActive: true,
      });
    } else {
      deviceToken.isActive = true;
      deviceToken.updatedAt = new Date();
    }

    return this.deviceTokenRepository.save(deviceToken);
  }

  async removeDeviceToken(token: string): Promise<void> {
    await this.deviceTokenRepository.delete({ token });
    this.logger.log(`Device token removed: ${token}`);
  }

  async sendToUser(userId: string, payload: PushPayload): Promise<void> {
    const tokens = await this.deviceTokenRepository.find({
      where: { userId, isActive: true },
    });

    if (!tokens || tokens.length === 0) {
      throw new NotFoundException(`No active device tokens found for user ${userId}`);
    }

    for (const token of tokens) {
      await this.sendToToken(token.token, payload);
    }
  }

  async sendToMultipleUsers(userIds: string[], payload: PushPayload): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const userId of userIds) {
      try {
        await this.sendToUser(userId, payload);
        sent++;
      } catch (error) {
        failed++;
        this.logger.error(`Failed to send push to user ${userId}`, error);
      }
    }

    return { sent, failed };
  }

  async broadcastToAllActive(payload: PushPayload): Promise<{ sent: number; failed: number }> {
    const tokens = await this.deviceTokenRepository.find({
      where: { isActive: true },
    });

    let sent = 0;
    let failed = 0;

    for (const token of tokens) {
      try {
        await this.sendToToken(token.token, payload);
        sent++;
      } catch (error) {
        failed++;
        this.logger.error(`Failed to send broadcast to token ${token.token}`, error);
      }
    }

    return { sent, failed };
  }

  async sendToToken(token: string, payload: PushPayload): Promise<void> {
    try {
      // Implement FCM or your push service integration here
      // This is a placeholder for the actual implementation
      this.logger.log(`Push notification sent to token: ${token}`);
      // Example: await this.firebaseAdmin.messaging().send({ token, notification: {...} });
    } catch (error) {
      this.logger.error(`Failed to send push to token ${token}`, error);
      throw error;
    }
  }

  async getUserDeviceTokens(userId: string): Promise<DeviceToken[]> {
    return this.deviceTokenRepository.find({
      where: { userId, isActive: true },
    });
  }

  async deactivateUserTokens(userId: string): Promise<void> {
    await this.deviceTokenRepository.update(
      { userId },
      { isActive: false },
    );
    this.logger.log(`Deactivated all tokens for user ${userId}`);
  }
}
