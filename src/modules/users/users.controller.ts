import {
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Request, Response } from 'express';

import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthUser } from '../auth/guards/auth-user.decorator';

import { User } from './models/user.model';
import { UserProfileDto } from './dtos/user-profile.dto';
import { ApiResponse as TApiResponse } from './types/api-response.type';

@UseInterceptors(ClassSerializerInterceptor)
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
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Request account deletion',
    description:
      'Allows a user to request the deletion of their account. This action is irreversible.',
  })
  @ApiResponse({
    status: 201,
    description:
      'Account deletion request successfully created, you will receive a verification email shortly.',
    schema: {
      example: {
        success: true,
        message:
          'Account deletion request created. Please check your email for OTP verification.',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description:
      'Unauthorized - User must be authenticated to request account deletion',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not allowed to request account deletion',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async requestAccountDeletion(@Req() req: any, @Res() res: Response) {
    const userId = req?.user?.id;
    console.log('User ID for account deletion request:', userId);
  }

  @Post('/delete/confirm')
  @ApiOperation({
    summary: 'Confirm account deletion',
    description:
      "Confirms the deletion of a user account after verifying the OTP sent to the user's email.",
  })
  @ApiResponse({
    status: 200,
    description: 'Account successfully deleted',
    schema: {
      example: {
        success: true,
        message: 'Account deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid or expired OTP',
    schema: {
      example: {
        success: false,
        message: 'Invalid or expired OTP',
        error: 'The provided OTP is incorrect or has expired',
        status_code: 400,
      },
    },
  })
  async confirmAccountDeletion() {}
}
