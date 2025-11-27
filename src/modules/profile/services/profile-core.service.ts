import { Injectable, HttpStatus } from '@nestjs/common';
import { ProfileModelAction } from '../profile.model-action';
import { SaveProfileDto } from '../dto/save-profile.dto';
import { CreateProfileDto } from '../dto/create-profile.dto';
import { Profile } from '../models/profile.model';
import { CustomHttpException } from '@shared/custom.exception';
import { UserModelAction } from '@modules/users/action-models/user.action-model';

@Injectable()
export class ProfileCoreService {
  constructor(
    private readonly profileModelAction: ProfileModelAction,
    private readonly userModelAction: UserModelAction,
  ) {}

  async createProfile(
    userId: string,
    createData: CreateProfileDto,
  ): Promise<Profile> {
    const createPayload: Partial<Profile> = {
      userId,
      avatar: createData.avatar ?? null,
      language: createData.language ?? null,
      username: createData.username ? createData.username.toLowerCase() : null,
    };

    const createdProfile = await this.profileModelAction.create({
      createPayload,
      transactionOptions: { useTransaction: false },
    });

    if (!createdProfile) {
      throw new CustomHttpException(
        'Failed to create profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return createdProfile;
  }

  async getProfile(userId: string): Promise<Profile | null> {
    return this.profileModelAction.get(
      { userId },
      {
        select: {
          id: true,
          userId: true,
          avatar: true,
          language: true,
          username: true,
          user: {
            name: true,
            email: true,
          },
        },
      },
      ['user'],
    );
  }

  async updateProfile(
    userId: string,
    updateData: SaveProfileDto,
  ): Promise<Profile> {
    // Prepare profile update payload (only Profile table fields)
    const profileUpdatePayload: Partial<Profile> = {};

    // Avatar: only update if provided and not null
    if (updateData.avatar !== undefined && updateData.avatar !== null) {
      profileUpdatePayload.avatar = updateData.avatar;
    }

    // Language: only update if provided, not null, and not empty
    if (
      updateData.language !== undefined &&
      updateData.language !== null &&
      updateData.language.trim() !== ''
    ) {
      profileUpdatePayload.language = updateData.language;
    }

    // Username: only update if provided, not null, and not empty
    if (
      updateData.username !== undefined &&
      updateData.username !== null &&
      updateData.username.trim() !== ''
    ) {
      profileUpdatePayload.username = updateData.username.toLowerCase();
    }

    // Update profile fields if any exist
    if (Object.keys(profileUpdatePayload).length > 0) {
      const updatedProfile = await this.profileModelAction.update({
        updatePayload: profileUpdatePayload,
        identifierOptions: { userId },
        transactionOptions: { useTransaction: false },
      });

      if (!updatedProfile) {
        throw new CustomHttpException(
          'Failed to update profile',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    // Update user name separately (it's on the User table, not Profile)
    if (
      updateData.name !== undefined &&
      updateData.name !== null &&
      updateData.name.trim() !== ''
    ) {
      const updatedUser = await this.userModelAction.update({
        updatePayload: { name: updateData.name },
        identifierOptions: { id: userId },
        transactionOptions: { useTransaction: false },
      });

      if (!updatedUser) {
        throw new CustomHttpException(
          'Failed to update user name',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    // Fetch and return the complete profile with user relation
    const profile = await this.getProfile(userId);

    if (!profile) {
      throw new CustomHttpException(
        'Profile not found after update',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return profile;
  }
}
