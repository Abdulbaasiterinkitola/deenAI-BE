import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { EmailService } from '../../email/email.service';
import { PushNotificationService } from '../../push-notifications/push-notification.service';
import {
  NotificationLog,
  NotificationStatus,
  NotificationType,
} from '../../notification-settings/entities/notification-log.entity';
import { User } from '../../users/models/user.model';
import { SendBulkEmailDto } from '../dtos/send-bulk-email.dto';
import { SendBulkPushDto } from '../dtos/send-bulk-push.dto';

@Processor('notifications')
@Injectable()
export class NotificationsProcessor {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly pushNotificationService: PushNotificationService,
    @InjectRepository(NotificationLog)
    private readonly notificationLogRepository: Repository<NotificationLog>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Process('send-bulk-email')
  async handleSendBulkEmail(job: Job<SendBulkEmailDto>) {
    const { userIds, filters, subject, template, context } = job.data;
    let recipients: User[] = [];

    if (userIds && userIds.length > 0) {
      recipients = await this.userRepository.find({
        where: { id: In(userIds) },
      });
    } else if (filters) {
      const query = this.userRepository.createQueryBuilder('user');

      if (filters.status) {
        query.andWhere('user.status = :status', { status: filters.status });
      }
      if (filters.plan) {
        query.andWhere('user.plan = :plan', { plan: filters.plan });
      }
      if (filters.registrationDateFrom) {
        query.andWhere('user.createdAt >= :dateFrom', {
          dateFrom: filters.registrationDateFrom,
        });
      }
      if (filters.registrationDateTo) {
        query.andWhere('user.createdAt <= :dateTo', {
          dateTo: filters.registrationDateTo,
        });
      }

      recipients = await query.getMany();
    }

    const templateName = template || 'newsletter-welcome';
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < recipients.length; i++) {
      const user = recipients[i];
      const log = this.notificationLogRepository.create({
        type: NotificationType.EMAIL,
        recipient: user.email,
        subject,
        userId: user.id,
        status: NotificationStatus.PENDING,
      });

      try {
        const emailContext = {
          ...context,
          name: user.name || 'Subscriber',
          unsubscribeLink: `${process.env.FRONTEND_URL}/newsletter/unsubscribe`,
        };

        await this.emailService.sendEmail(
          user.email,
          subject,
          templateName,
          emailContext,
        );
        log.status = NotificationStatus.SENT;
        log.sentAt = new Date();
        sent++;
      } catch (error) {
        log.status = NotificationStatus.FAILED;
        log.error = error.message;
        failed++;
        this.logger.error(`Failed to send email to ${user.email}`, error);
      }

      await this.notificationLogRepository.save(log);
      await job.progress(((i + 1) / recipients.length) * 100);
    }

    this.logger.log(`Bulk email completed: ${sent} sent, ${failed} failed`);
    return { sent, failed, total: recipients.length };
  }

  @Process('send-bulk-push')
  async handleSendBulkPush(job: Job<SendBulkPushDto>) {
    const { userIds, filters, title, body, data, imageUrl } = job.data;
    let recipients: User[] = [];

    if (userIds && userIds.length > 0) {
      recipients = await this.userRepository.find({
        where: { id: In(userIds) },
      });
    } else if (filters) {
      const query = this.userRepository.createQueryBuilder('user');

      if (filters.status) {
        query.andWhere('user.status = :status', { status: filters.status });
      }
      if (filters.plan) {
        query.andWhere('user.plan = :plan', { plan: filters.plan });
      }

      recipients = await query.getMany();
    }

    let sent = 0;
    let failed = 0;

    for (let i = 0; i < recipients.length; i++) {
      const user = recipients[i];
      const log = this.notificationLogRepository.create({
        type: NotificationType.PUSH,
        recipient: user.email,
        subject: title,
        message: body,
        userId: user.id,
        status: NotificationStatus.PENDING,
      });

      try {
        await this.pushNotificationService.sendToUser(user.id, {
          title,
          body,
          data,
          imageUrl,
        });
        log.status = NotificationStatus.SENT;
        log.sentAt = new Date();
        sent++;
      } catch (error) {
        log.status = NotificationStatus.FAILED;
        log.error = error.message;
        failed++;
        this.logger.error(`Failed to send push to user ${user.id}`, error);
      }

      await this.notificationLogRepository.save(log);
      await job.progress(((i + 1) / recipients.length) * 100);
    }

    this.logger.log(`Bulk push completed: ${sent} sent, ${failed} failed`);
    return { sent, failed, total: recipients.length };
  }

  @Process('broadcast-push')
  async handleBroadcastPush(
    job: Job<{ title: string; body: string; data?: any; imageUrl?: string }>,
  ) {
    const { title, body, data, imageUrl } = job.data;

    const result = await this.pushNotificationService.broadcastToAllActive({
      title,
      body,
      data,
      imageUrl,
    });

    this.logger.log(
      `Broadcast completed: ${result.sent} sent, ${result.failed} failed`,
    );
    return result;
  }
}
