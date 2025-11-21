import {
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Controller, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';

import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthUser } from '../auth/guards/auth-user.decorator';

import { User } from './models/user.model';
import { UserProfileDto } from './dtos/user-profile.dto';
import { ApiResponse as TApiResponse } from './types/api-response.type';
import { ConfirmAccountDeletionDto } from './dtos/confirm-account-deletion.dto';
import { RequestAccountDeletionDocs } from './docs/request-account-deletion.doc';
import { ConfirmAccountDeletionDocs } from './docs/confirm-account-deletion.doc';

@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get('me')
  getProfile(@AuthUser() user: User): TApiResponse<UserProfileDto> {
    const profileData = this.usersService.getUserProfile(user);
    return {
      success: true,
      status: 'success',
      data: profileData,
      message: 'User profile retrieved successfully',
      meta: null,
      status_code: 200,
    };
  }
  /**
   * * POST endpoint to request account deletion
   * Requires authentication
   */
  @Post('/delete/request')
  @HttpCode(HttpStatus.CREATED)
  @RequestAccountDeletionDocs.requestAccountDeletion()
  async requestAccountDeletion(@AuthUser() user: User) {
    return await this.usersService.requestAccountDeletion(user);
  }

  @Post('/delete/confirm')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ConfirmAccountDeletionDocs.confirmAccountDeletion()
  async confirmAccountDeletion(
    @AuthUser() user: User,
    @Body() body: ConfirmAccountDeletionDto,
  ) {
    return await this.usersService.confirmAccountDeletion(user, body.otp);
  }
}
