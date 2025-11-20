import {
  Controller,
  Get,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { UsersService } from './users.service';

import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthUser } from '../auth/guards/auth-user.decorator';

import { User } from './models/user.model';
import { UserProfileDto } from './dtos/user-profile.dto';
import { ApiResponse } from './types/api-response.type';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get('me')
  getProfile(@AuthUser() user: User): ApiResponse<UserProfileDto> {
    const profileData = this.usersService.getUserProfile(user);
    return {
      success: true,
      data: profileData,
      message: 'User profile retrieved successfully',
      meta: null,
    };
  }
}
