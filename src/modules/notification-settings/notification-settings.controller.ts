import {
  Controller,
  Get,
  Patch,
  Put,
  Req,
  UseGuards,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../guards/auth.guard';
import { UpdateNotificationSettingsDto } from './dtos/update-notification-settings.dto';
import { NotificationSettingsCoreService } from './services/notification-settings-core.service';
import { User } from '../users/models/user.model';
import { NotificationSettings } from './models/notification-setting.model';
import {
  GetNotificationSettingsDocs,
  UpdateNotificationSettingsDocs,
} from './docs/notification-settings.doc';

interface AuthenticatedRequest extends Request {
  user: User;
}

@ApiTags('notification-settings')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('notification-settings')
export class NotificationSettingsController {
  constructor(
    private readonly notificationSettingsCoreService: NotificationSettingsCoreService,
  ) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @GetNotificationSettingsDocs()
  async getMe(@Req() req: AuthenticatedRequest): Promise<NotificationSettings> {
    return this.notificationSettingsCoreService.getSettings(req.user.id);
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @UpdateNotificationSettingsDocs()
  async patchMe(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateNotificationSettingsDto,
  ): Promise<NotificationSettings> {
    return this.notificationSettingsCoreService.updateSettings(
      req.user.id,
      dto,
    );
  }

  @Put('me')
  @HttpCode(HttpStatus.OK)
  @UpdateNotificationSettingsDocs()
  async putMe(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateNotificationSettingsDto,
  ): Promise<NotificationSettings> {
    return this.notificationSettingsCoreService.updateSettings(
      req.user.id,
      dto,
    );
  }
}
