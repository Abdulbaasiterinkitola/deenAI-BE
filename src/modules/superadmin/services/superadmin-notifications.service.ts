import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailService } from '../../email/email.service';
import {
  NotificationLog,
  NotificationStatus,
  NotificationType,
} from '../../notification-settings/entities/notification-log.entity';
import { UsersService } from '../../users/users.service';
import { SendEmailDto } from '../dtos/send-email.dto';
import { NotificationHistoryQueryDto } from '../dtos/notification-history-query.dto';
import { User } from '../../users/models/user.model';
import { SendBulkEmailDto } from '../dtos/send-bulk-email.dto';
import { SendPushDto } from '../dtos/send-push.dto';
import { SendBulkPushDto } from '../dtos/send-bulk-push.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Logger } from '@nestjs/common';
import { SendTestEmailDto } from '../dtos/send-test-email.dto';
import { PushNotificationService } from '../../push-notifications/push-notification.service';

@Injectable()
export class SuperadminNotificationsService {
  private readonly logger = new Logger(SuperadminNotificationsService.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
    private readonly pushNotificationService: PushNotificationService,
    @InjectRepository(NotificationLog)
    private readonly notificationLogRepository: Repository<NotificationLog>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectQueue('notifications') private readonly notificationsQueue: Queue,
  ) {}

  async sendEmail(sendEmailDto: SendEmailDto): Promise<NotificationLog> {
    const { userId, email, subject, template, context } = sendEmailDto;
    let recipientEmail: string;
    let user: User | undefined;

    if (userId) {
      // Coalesce null to undefined to match the type of `user`
      user = (await this.usersService.getUserById(userId)) ?? undefined;
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found.`);
      }
      recipientEmail = user.email;
    } else if (email) {
      recipientEmail = email;
    } else {
      throw new BadRequestException('Either userId or email must be provided.');
    }

    const log = this.notificationLogRepository.create({
      type: NotificationType.EMAIL,
      recipient: recipientEmail,
      subject,
      userId: user?.id,
      status: NotificationStatus.PENDING,
    });
    await this.notificationLogRepository.save(log);

    try {
      const templateName = template || 'newsletter-welcome';
      const emailContext = {
        ...context,
        name: user?.name || context?.name || 'Subscriber',
      };

      await this.emailService.sendEmail(
        recipientEmail,
        subject,
        templateName,
        emailContext,
      );
      log.status = NotificationStatus.SENT;
      log.sentAt = new Date();
      this.logger.log(`Email sent to ${recipientEmail}`);
    } catch (error) {
      log.status = NotificationStatus.FAILED;
      log.error = error.message;
      this.logger.error(`Failed to send email to ${recipientEmail}`, error);
    }

    return this.notificationLogRepository.save(log);
  }

  async sendTestEmail(dto: SendTestEmailDto): Promise<void> {
    const { email, subject, template, context } = dto;

    try {
      // The sendTestEmail DTO should specify a template to test
      const templateName = template || 'announcement'; // Default test template
      const emailContext = {
        ...context,
        name: 'Test User',
        unsubscribeLink: `${process.env.FRONTEND_URL}/newsletter/unsubscribe`,
      };

      await this.emailService.sendEmail(
        email,
        subject,
        templateName,
        emailContext,
      );
      this.logger.log(
        `Test email sent to ${email} with template ${templateName}`,
      );
    } catch (error) {
      this.logger.error(`Failed to send test email to ${email}`, error);
      throw new BadRequestException(
        `Failed to send test email: ${error.message}`,
      );
    }
  }

  async sendBulkEmail(dto: SendBulkEmailDto) {
    const job = await this.notificationsQueue.add('send-bulk-email', dto, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
    this.logger.log(`Bulk email job created with ID ${job.id}`);
    return { jobId: job.id };
  }

  async sendPush(sendPushDto: SendPushDto): Promise<NotificationLog> {
    const { userId, title, body, data, imageUrl } = sendPushDto;

    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    const log = this.notificationLogRepository.create({
      type: NotificationType.PUSH,
      recipient: user.email,
      subject: title,
      message: body,
      userId: user.id,
      status: NotificationStatus.PENDING,
    });
    await this.notificationLogRepository.save(log);

    try {
      await this.pushNotificationService.sendToUser(userId, {
        title,
        body,
        data,
        imageUrl,
      });
      log.status = NotificationStatus.SENT;
      log.sentAt = new Date();
      this.logger.log(`Push notification sent to user ${userId}`);
    } catch (error) {
      log.status = NotificationStatus.FAILED;
      log.error = error.message;
      this.logger.error(`Failed to send push to user ${userId}`, error);
    }

    return this.notificationLogRepository.save(log);
  }

  async sendBulkPush(dto: SendBulkPushDto) {
    const job = await this.notificationsQueue.add('send-bulk-push', dto, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
    this.logger.log(`Bulk push job created with ID ${job.id}`);
    return { jobId: job.id };
  }

  async broadcastPush(
    title: string,
    body: string,
    data?: any,
    imageUrl?: string,
  ) {
    const job = await this.notificationsQueue.add(
      'broadcast-push',
      { title, body, data, imageUrl },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );
    this.logger.log(`Broadcast push job created with ID ${job.id}`);
    return { jobId: job.id };
  }

  async getEmailTemplates(): Promise<string[]> {
    return Promise.resolve([
      'welcome',
      'reset-password',
      'newsletter',
      'announcement',
    ]);
  }

  async getNotificationHistory(query: NotificationHistoryQueryDto) {
    const { page = 1, limit = 10, type, userId, status } = query;

    const where: any = {};
    if (type) where.type = type;
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const [data, total] = await this.notificationLogRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: {
        sentAt: 'DESC',
      },
    });

    return {
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async getJobStatus(jobId: string) {
    const job = await this.notificationsQueue.getJob(jobId);
    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found.`);
    }
    return {
      id: job.id,
      state: await job.getState(),
      progress: job.progress(),
      attempts: job.attemptsMade,
      data: job.data,
    };
  }
}
