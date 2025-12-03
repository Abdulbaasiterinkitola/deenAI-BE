import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { SuperadminNotificationsService } from '../services/superadmin-notifications.service';
import { SendEmailDto } from '../dtos/send-email.dto';
import { SendBulkEmailDto } from '../dtos/send-bulk-email.dto';
import { SendPushDto } from '../dtos/send-push.dto';
import { SendBulkPushDto } from '../dtos/send-bulk-push.dto';
import { SendTestEmailDto } from '../dtos/send-test-email.dto';
import { NotificationHistoryQueryDto } from '../dtos/notification-history-query.dto';
import { SuperadminGuard } from '../guards/superadmin.guard';

@ApiTags('Superadmin Notifications')
@ApiBearerAuth()
@Controller('superadmin/notifications')
@UseGuards(SuperadminGuard)
export class SuperadminNotificationsController {
  constructor(
    private readonly superadminNotificationsService: SuperadminNotificationsService,
  ) {}

  // Email endpoints
  @Post('email/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send email to single user' })
  @ApiResponse({
    status: 200,
    description: 'Email sent successfully',
  })
  async sendEmail(@Body() sendEmailDto: SendEmailDto) {
    return this.superadminNotificationsService.sendEmail(sendEmailDto);
  }

  @Post('email/test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send test email to specified address' })
  @ApiResponse({
    status: 200,
    description: 'Test email sent successfully',
  })
  async sendTestEmail(@Body() testEmailDto: SendTestEmailDto) {
    // Pass the DTO directly to the service method
    await this.superadminNotificationsService.sendTestEmail(testEmailDto);
    return { message: 'Test email sent successfully' };
  }

  @Post('email/bulk')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Send email to multiple users (background job)' })
  @ApiResponse({
    status: 202,
    description: 'Bulk email job created',
  })
  async sendBulkEmail(@Body() sendBulkEmailDto: SendBulkEmailDto) {
    return this.superadminNotificationsService.sendBulkEmail(sendBulkEmailDto);
  }

  @Get('email/templates')
  @ApiOperation({ summary: 'Get available email templates' })
  @ApiResponse({
    status: 200,
    description: 'List of available templates',
  })
  async getEmailTemplates() {
    const templates =
      await this.superadminNotificationsService.getEmailTemplates();
    return { templates };
  }

  // Push notification endpoints
  @Post('push/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send push notification to single user' })
  @ApiResponse({
    status: 200,
    description: 'Push notification sent successfully',
  })
  async sendPush(@Body() sendPushDto: SendPushDto) {
    return this.superadminNotificationsService.sendPush(sendPushDto);
  }

  @Post('push/bulk')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Send push notifications to multiple users (background job)',
  })
  @ApiResponse({
    status: 202,
    description: 'Bulk push job created',
  })
  async sendBulkPush(@Body() sendBulkPushDto: SendBulkPushDto) {
    return this.superadminNotificationsService.sendBulkPush(sendBulkPushDto);
  }

  @Post('push/broadcast')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Broadcast push notification to all active users' })
  @ApiResponse({
    status: 202,
    description: 'Broadcast push job created',
  })
  async broadcastPush(
    @Body()
    body: {
      title: string;
      body: string;
      data?: Record<string, string>;
      imageUrl?: string;
    },
  ) {
    return this.superadminNotificationsService.broadcastPush(
      body.title,
      body.body,
      body.data,
      body.imageUrl,
    );
  }

  // History endpoints
  @Get('history')
  @ApiOperation({
    summary: 'Get notification history with pagination and filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification history retrieved',
  })
  async getNotificationHistory(@Query() query: NotificationHistoryQueryDto) {
    return this.superadminNotificationsService.getNotificationHistory(query);
  }

  @Get('jobs/:jobId')
  @ApiOperation({ summary: 'Get background job status' })
  @ApiResponse({
    status: 200,
    description: 'Job status retrieved',
  })
  async getJobStatus(@Param('jobId') jobId: string) {
    return this.superadminNotificationsService.getJobStatus(jobId);
  }
}
