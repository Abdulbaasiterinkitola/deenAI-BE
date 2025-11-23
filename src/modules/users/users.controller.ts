import {
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
  Body,
  UsePipes,
  ValidationPipe,
  Patch,
} from '@nestjs/common';
import { Controller, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';

import { AuthGuard } from '@guards/auth.guard';
import { AuthUser } from '@guards/auth-user.decorator';

import { User } from './models/user.model';
import { UserProfileDto } from './dtos/user-profile.dto';
import { ApiResponse as TApiResponse } from './types/api-response.type';
import { ConfirmAccountDeletionDto } from './dtos/confirm-account-deletion.dto';
import { RequestAccountDeletionDocs } from './docs/request-account-deletion.doc';
import { ConfirmAccountDeletionDocs } from './docs/confirm-account-deletion.doc';
import { ChangePlanDto } from './dtos/change-plan.dto';
import { PlanChangeResponseDto } from './dtos/plan-change-response.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

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

  @Patch('plan')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Change user subscription plan' })
  @ApiResponse({
    status: 200,
    description: 'Plan changed successfully',
    type: PlanChangeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async changePlan(
    @AuthUser() user: User,
    @Body() changePlanDto: ChangePlanDto,
  ): Promise<PlanChangeResponseDto> {
    return this.usersService.changeUserPlan(user.id, changePlanDto.planId);
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
