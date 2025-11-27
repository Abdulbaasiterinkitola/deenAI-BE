import { Injectable } from '@nestjs/common';
import { ProfileValidationService } from './services/profile-validation.service';
import { ProfileCoreService } from './services/profile-core.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { Profile } from './models/profile.model';
import { ProfileAvatarService } from './services/profile-avatar.service';
import { SaveProfileDto } from './dto/save-profile.dto';

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

async updateProfile(
  userId: string,
  updateData: UpdateProfileDto,
): Promise<Profile> {
  await this.profileValidationService.validateProfileExists(userId);

  if (updateData.username !== undefined && updateData.username !== null) {
    await this.profileValidationService.validateUsernameUnique(
      updateData.username,
      userId,
    );
  }

  let avatarUrl: string | undefined;

  if (updateData.avatar && updateData.avatar.buffer && updateData.avatar.buffer.length > 0) {
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
  };

  const updatedProfile = await this.profileCoreService.updateProfile(
    userId,
    saveData,
  );

  return updatedProfile;
}

  async getProfile(userId: string) {
    return this.profileCoreService.getProfile(userId);
  }
}