import {
  Controller,
  Patch,
  Body,
  UseGuards,
  Req,
  HttpCode,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from '@modules/auth/guards/auth.guard';
import { UpdateProfileDocs } from './docs/update-profile.docs';

@Controller('users/me/profile')
@ApiTags('Profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Patch()
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @UpdateProfileDocs.updateProfile()
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
