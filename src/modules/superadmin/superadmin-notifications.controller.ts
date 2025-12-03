import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SuperadminGuard } from '../../guards/superadmin.guard';
import { SendBulkEmailDto } from './dtos/send-bulk-email.dto';
import { SendEmailDto } from './dtos/send-email.dto';
import { SendTestEmailDto } from './dtos/send-test-email.dto';
import { SuperadminNotificationsService } from './services/superadmin-notifications.service';
import { NotificationHistoryQueryDto } from './dtos/notification-history-query.dto';

@ApiTags('Superadmin - Notifications')
@ApiBearerAuth()
@UseGuards(SuperadminGuard)
@Controller('superadmin/notifications')
export class SuperadminNotificationsController {
  constructor(
    private readonly notificationsService: SuperadminNotificationsService,
  ) {}

  @Post('email/send')
  @ApiOperation({ summary: 'Send an email to a single user' })
  @ApiResponse({
    status: 201,
    description: 'Email sent successfully and logged.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  sendEmail(@Body() sendEmailDto: SendEmailDto) {
    return this.notificationsService.sendEmail(sendEmailDto);
  }

  @Post('email/bulk')
  @ApiOperation({ summary: 'Send email to multiple users in bulk' })
  @ApiResponse({
    status: 201,
    description: 'Bulk email job has been queued.',
    schema: {
      type: 'object',
      properties: {
        jobId: {
          type: 'string',
          example: '123',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  sendBulkEmail(@Body() sendBulkEmailDto: SendBulkEmailDto) {
    return this.notificationsService.sendBulkEmail(sendBulkEmailDto);
  }

  @Get('email/templates')
  @ApiOperation({ summary: 'Get a list of available email templates' })
  @ApiResponse({
    status: 200,
    description: 'List of email templates.',
    type: [String],
  })
  getEmailTemplates() {
    return this.notificationsService.getEmailTemplates();
  }

  @Post('email/test')
  @ApiOperation({ summary: 'Send a test email' })
  @ApiResponse({ status: 201, description: 'Test email sent successfully.' })
  sendTestEmail(@Body() testEmailDto: SendTestEmailDto) {
    // The `sendEmail` service method is flexible enough to handle this,
    // as it can accept an email address directly without a userId.
    // We pass the test DTO's data into the structure expected by the service.
    const { email, subject, template, context } = testEmailDto;
    return this.notificationsService.sendEmail({
      email,
      subject,
      template,
      context,
    });
  }

  @Get('history')
  @ApiOperation({ summary: 'Get paginated notification history' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of notification logs.',
  })
  getNotificationHistory(@Query() query: NotificationHistoryQueryDto) {
    return this.notificationsService.getNotificationHistory(query);
  }

  // --- Push Notification Endpoints (Structure) ---

  @Post('push/send')
  @ApiOperation({
    summary: 'Send a push notification to a single user (Not Implemented)',
  })
  sendPush() {
    return { message: 'Push notification system not implemented.' };
  }

  @Post('push/bulk')
  @ApiOperation({
    summary: 'Send push notifications to multiple users (Not Implemented)',
  })
  sendBulkPush() {
    return { message: 'Push notification system not implemented.' };
  }

  @Post('push/broadcast')
  @ApiOperation({
    summary:
      'Broadcast a push notification to all active users (Not Implemented)',
  })
  broadcastPush() {
    return { message: 'Push notification system not implemented.' };
  }
}
