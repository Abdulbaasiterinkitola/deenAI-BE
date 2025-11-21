import {
  Controller,
  Patch,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { AuthGuard } from '@guards/auth.guard';
import { UpdateProfileDocs } from './docs/update-profile.docs';
import { CreateProfileDocs } from './docs/create-profile.docs';

@Controller('users/me/profile')
@ApiTags('Profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(AuthGuard)
  @CreateProfileDocs.createProfile()
  async createProfile(
    @Req() request: any,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    const user = request.user;
    const userId = user.id as string;

    const profile = await this.profileService.createProfile(
      userId,
      createProfileDto,
    );

    return {
      success: true,
      message: 'Profile created successfully',
      data: profile,
    };
  }

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
