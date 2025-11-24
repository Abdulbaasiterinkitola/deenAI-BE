import {
  Controller,
  Patch,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  UseInterceptors,
  UploadedFile,
  Get,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from '@guards/auth.guard';
import { UpdateProfileDocs } from './docs/update-profile.docs';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { GetProfileDocs } from './docs/get-profile.docs';

@Controller('users/me/profile')
@ApiTags('Profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @GetProfileDocs.getProfile()
  async getProfile(@Req() request: any) {
    const user = request.user;
    const userId = user.id as string;
    return this.profileService.getProfile(userId);
  }

  @Patch()
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: multer.memoryStorage(),
      limits: {
        fileSize: Number(process.env.PROFILE_IMAGE_MAX_SIZE),
      },
    }),
  )
  @UpdateProfileDocs.updateProfile()
  async updateProfile(
    @Req() request: any,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    // Get user from request (AuthGuard attaches full user object)
    const user = request.user;
    const userId = user.id as string;

    const payload = { ...updateProfileDto, avatar };

    // Update the profile
    const updatedProfile = await this.profileService.updateProfile(
      userId,
      payload,
    );

    // Return success response
    return {
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile,
    };
  }
}
