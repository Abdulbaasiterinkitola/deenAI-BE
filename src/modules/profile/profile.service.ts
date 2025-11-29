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

    // Handle file upload
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
    // Handle base64 upload
    else if (updateData.avatarBase64) {
      avatarUrl = await this.profileAvatarService.updateAvatarFromBase64(
        userId,
        updateData.avatarBase64,
        'avatar.jpg', // default filename for base64
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

    return this.buildProfileResponse(updatedProfile, updateData.requestHost);
  }

  async getProfile(userId: string, requestHost?: string) {
    const profile = await this.profileCoreService.getProfile(userId);

    if (!profile) {
      throw new CustomHttpException(
        'Profile not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return this.buildProfileResponse(profile, requestHost);
  }

  private buildProfileResponse(profile: Profile, requestHost?: string) {
    const timezone = profile?.user?.timezone || 'UTC';
    
    // Construct full avatar URL
    let avatarUrl = profile.avatar;
    if (avatarUrl) {
      // If it's a relative path (local upload), add the host
      if (avatarUrl.startsWith('/uploads/')) {
        avatarUrl = requestHost ? `${requestHost}${avatarUrl}` : avatarUrl;
      }
      // If it's already a full URL (Google avatar, etc.), keep as is
    }

    return {
      id: profile.id,
      userId: profile.userId,
      name: profile.user?.name ?? null,
      email: profile.user?.email ?? null,
      username: profile.username,
      language: profile.language,
      avatar: avatarUrl,
      timezone,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
