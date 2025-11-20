import {
  Controller,
  Patch,
  Body,
  UseGuards,
  Req,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from '@modules/auth/guards/auth.guard';

@Controller('users/me/profile')
@ApiTags('Profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Patch()
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update user profile',
    description:
      'Update authenticated user profile information including avatar, language, and username',
  })
  @ApiBody({
    type: UpdateProfileDto,
    description: 'Profile update data',
    examples: {
      updateAll: {
        summary: 'Update all fields',
        value: {
          username: 'john_doe',
          language: 'en',
          avatar: 'https://example.com/avatar.jpg',
        },
      },
      updateUsername: {
        summary: 'Update only username',
        value: {
          username: 'new_username',
        },
      },
      clearAvatar: {
        summary: 'Clear avatar',
        value: {
          avatar: null,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          userId: '123e4567-e89b-12d3-a456-426614174001',
          avatar: 'https://example.com/avatar.jpg',
          language: 'en',
          username: 'john_doe',
          createdAt: '2025-01-15T10:00:00.000Z',
          updatedAt: '2025-01-15T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Username already exists',
    schema: {
      example: {
        success: false,
        message: 'Username already exists',
        status_code: 400,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
    schema: {
      example: {
        success: false,
        message: 'Authorization Header Missing',
        status_code: 401,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found',
    schema: {
      example: {
        success: false,
        message: 'Profile not found',
        status_code: 404,
      },
    },
  })
  @ApiResponse({
    status: 422,
    description: 'Validation failed',
    schema: {
      example: {
        success: false,
        message: 'Validation failed',
        errors: {
          username: [
            'Username must be at least 3 characters long',
            'Username can only contain letters, numbers, and underscores',
          ],
        },
        status_code: 422,
      },
    },
  })
  async updateProfile(
    @Req() request: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    // Get user from request (AuthGuard attaches full user object)
    const user = request.user;
    const userId = user.id as string;

    // Update the profile
    const updatedProfile = await this.profileService.updateProfile(
      userId,
      updateProfileDto,
    );

    // Return success response
    return {
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile,
    };
  }
}
