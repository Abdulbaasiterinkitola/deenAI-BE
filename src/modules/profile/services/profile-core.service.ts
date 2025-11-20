import { Injectable } from '@nestjs/common';
import { ProfileModelAction } from '../profile.model-action';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { Profile } from '../models/profile.model';

@Injectable()
export class ProfileCoreService {
  constructor(private readonly profileModelAction: ProfileModelAction) {}

  // Update a user's profile
  async updateProfile(
    userId: string,
    updateData: UpdateProfileDto,
  ): Promise<Profile> {
    // Prepare the data to update
    const updatePayload: any = {};

    // Only include fields that were actually sent
    if (updateData.avatar !== undefined) {
      updatePayload.avatar = updateData.avatar;
    }

    if (updateData.language !== undefined) {
      updatePayload.language = updateData.language;
    }

    if (updateData.username !== undefined) {
      // Store username in lowercase for consistency
      updatePayload.username = updateData.username
        ? updateData.username.toLowerCase()
        : null;
    }

    // Update the profile in the database
    const updatedProfile = await this.profileModelAction.update({
      updatePayload,
      identifierOptions: { userId },
      transactionOptions: { useTransaction: false },
    });

    if (!updatedProfile) {
      throw new Error('Failed to update profile');
    }

    return updatedProfile;
  }
}
