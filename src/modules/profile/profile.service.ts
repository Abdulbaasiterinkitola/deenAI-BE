import { Injectable } from '@nestjs/common';
import { ProfileValidationService } from './services/profile-validation.service';
import { ProfileCoreService } from './services/profile-core.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { Profile } from './models/profile.model';
import { ProfileAvatarService } from './services/profile-avatar.service';

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileValidationService: ProfileValidationService,
    private readonly profileCoreService: ProfileCoreService,
    private readonly profileAvatarService: ProfileAvatarService,
  ) {}

  // Create a user's profile
  async createProfile(
    userId: string,
    createData: CreateProfileDto,
  ): Promise<Profile> {
    await this.profileValidationService.validateProfileDoesNotExist(userId);

    if (createData.username !== undefined && createData.username !== null) {
      await this.profileValidationService.validateUsernameUnique(
        createData.username,
        userId,
      );
    }

    return this.profileCoreService.createProfile(userId, createData);
  }

  // Main method to update a user's profile
  async updateProfile(
    userId: string,
    updateData: UpdateProfileDto,
  ): Promise<Profile> {
    // Step 1: Check if profile exists
    await this.profileValidationService.validateProfileExists(userId);

    // Step 2: If username is being updated, check if it's unique
    if (updateData.username !== undefined && updateData.username !== null) {
      await this.profileValidationService.validateUsernameUnique(
        updateData.username,
        userId,
      );
    }

    let avatarUrl: string | undefined;

    if (updateData.avatar instanceof Object) {
      avatarUrl = await this.profileAvatarService.updateAvatar(
        userId,
        updateData.avatar,
      );
    }

    // Step 3: Update the profile
    const updatedProfile = await this.profileCoreService.updateProfile(userId, {
      ...updateData,
      avatar: avatarUrl,
    });

    return updatedProfile;
  }

  async getProfile(userId: string) {
return  this.profileCoreService.getProfile(userId);
  }
}
