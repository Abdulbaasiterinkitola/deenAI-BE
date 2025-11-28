import { HttpStatus, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ProfileValidationService } from './services/profile-validation.service';
import { ProfileCoreService } from './services/profile-core.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { Profile } from './models/profile.model';
import { ProfileAvatarService } from './services/profile-avatar.service';
import { SaveProfileDto } from './dto/save-profile.dto';
import { CustomHttpException } from '@shared/custom.exception';

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
    transaction?: EntityManager,
  ): Promise<Profile> {
    await this.profileValidationService.validateProfileDoesNotExist(userId);

    if (createData.username !== undefined && createData.username !== null) {
      await this.profileValidationService.validateUsernameUnique(
        createData.username,
        userId,
      );
    }

    return this.profileCoreService.createProfile(
      userId,
      createData,
      transaction,
    );
  }

  async updateProfile(userId: string, updateData: UpdateProfileDto) {
    await this.profileValidationService.validateProfileExists(userId);

    if (updateData.username !== undefined && updateData.username !== null) {
      await this.profileValidationService.validateUsernameUnique(
        updateData.username,
        userId,
      );
    }

    let avatarUrl: string | undefined;

    if (
      updateData.avatar &&
      updateData.avatar.buffer &&
      updateData.avatar.buffer.length > 0
    ) {
      avatarUrl = await this.profileAvatarService.updateAvatar(
        userId,
        updateData.avatar,
      );
    }

    const saveData: SaveProfileDto = {
      language: updateData.language,
      username: updateData.username,
      name: updateData.name,
      avatar: avatarUrl,
      timezone: updateData.timezone,
    };

    const updatedProfile = await this.profileCoreService.updateProfile(
      userId,
      saveData,
    );

    if (!updatedProfile) {
      throw new CustomHttpException(
        'Failed to update profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return this.buildProfileResponse(updatedProfile);
  }

  async getProfile(userId: string) {
    const profile = await this.profileCoreService.getProfile(userId);

    if (!profile) {
      throw new CustomHttpException(
        'Profile not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return this.buildProfileResponse(profile);
  }

  private buildProfileResponse(profile: Profile) {
    const timezone = profile?.user?.timezone || 'UTC';

    return {
      id: profile.id,
      userId: profile.userId,
      name: profile.user?.name ?? null,
      email: profile.user?.email ?? null,
      username: profile.username,
      language: profile.language,
      avatar: profile.avatar,
      timezone,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
