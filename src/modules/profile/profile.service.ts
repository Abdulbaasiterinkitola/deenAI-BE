import { Injectable } from '@nestjs/common';
import { ProfileValidationService } from './services/profile-validation.service';
import { ProfileCoreService } from './services/profile-core.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from './models/profile.model';

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileValidationService: ProfileValidationService,
    private readonly profileCoreService: ProfileCoreService,
  ) {}

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

    // Step 3: Update the profile
    const updatedProfile = await this.profileCoreService.updateProfile(
      userId,
      updateData,
    );

    return updatedProfile;
  }
}
