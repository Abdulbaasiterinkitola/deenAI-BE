import {
  Controller,
  Get,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@modules/auth/guards/auth.guard';
import { NotificationSettingsService } from './notification-settings.service';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('notification-settings')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('notification-settings')
export class NotificationSettingsController {
  constructor(
    private readonly notificationSettingsService: NotificationSettingsService,
  ) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get authenticated user notification settings' })
  @ApiResponse({
    status: 200,
    description: 'Notification settings retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Notification settings not found' })
  async getMe(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const settings =
      await this.notificationSettingsService.findByUserId(userId);

    if (!settings) {
      throw new NotFoundException('Notification settings not found');
    }

    return settings;
  }
}
