import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdateNotificationSettingsDto } from '../dtos/update-notification-settings.dto';

export function GetNotificationSettingsDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get authenticated user notification settings' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Settings retrieved successfully',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Notification settings not found',
    }),
  );
}

export function UpdateNotificationSettingsDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Update notification settings' }),
    ApiBody({ type: UpdateNotificationSettingsDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Updated settings successfully',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Settings not found',
    }),
  );
}
