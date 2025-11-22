import {
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
  Body,
  UsePipes,
  ValidationPipe,
  Patch,
} from '@nestjs/common';
import { Controller, Post, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { SubscriptionsService } from '@modules/subscriptions/subscriptions.service';

import { AuthGuard } from '@guards/auth.guard';
import { AuthUser } from '@guards/auth-user.decorator';

import { User } from './models/user.model';
import { ConfirmAccountDeletionDto } from './dtos/confirm-account-deletion.dto';
import { RequestAccountDeletionDocs } from './docs/request-account-deletion.doc';
import { ConfirmAccountDeletionDocs } from './docs/confirm-account-deletion.doc';
import { ChangePlanDocs } from './docs/change-plan.doc';
import { ChangePlanDto } from './dtos/change-plan.dto';
import { PlanChangeResponseDto } from './dtos/plan-change-response.dto';

@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Patch('plan')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ChangePlanDocs.changePlan()
  async changePlan(
    @AuthUser() user: User,
    @Body() changePlanDto: ChangePlanDto,
  ): Promise<PlanChangeResponseDto> {
    return this.subscriptionsService.changePlan(user.id, changePlanDto.planId);
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

  /**
   * Pauses the authenticated user's account.
   */
  @Patch('me/pause')
  @HttpCode(HttpStatus.OK)
  // You can add API documentation here later if you use Swagger
  async pauseAccount(@AuthUser() user: User) {
    const pausedUser = await this.usersService.pauseAccount(user.id);
    return {
      status_code: HttpStatus.OK,
      message: 'Account successfully paused',
      data: {
        user: this.usersService.getUserProfile(pausedUser),
      },
    };
  }

  /**
   * Reactivates the authenticated user's paused account.
   */
  @Patch('me/reactivate')
  @HttpCode(HttpStatus.OK)
  // You can add API documentation here later if you use Swagger
  async reactivateAccount(@AuthUser() user: User) {
    const reactivatedUser = await this.usersService.reactivateAccount(user.id);
    return {
      status_code: HttpStatus.OK,
      message: 'Account successfully reactivated',
      data: {
        user: this.usersService.getUserProfile(reactivatedUser),
      },
    };
  }
}
