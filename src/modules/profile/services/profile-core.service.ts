import { Injectable, HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';
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
    private readonly dataSource: DataSource,
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
    const profileUpdatePayload: Partial<Profile> = {};

    if (updateData.avatar !== undefined && updateData.avatar !== null) {
      profileUpdatePayload.avatar = updateData.avatar;
    }

    if (updateData.language !== undefined && updateData.language !== null) {
      profileUpdatePayload.language = updateData.language;
    }

    if (updateData.username !== undefined && updateData.username !== null) {
      profileUpdatePayload.username = updateData.username.toLowerCase();
    }

    const userUpdatePayload: { name?: string; timezone?: string | null } = {};
    if (updateData.name !== undefined && updateData.name !== null) {
      userUpdatePayload.name = updateData.name;
    }
    if (updateData.timezone !== undefined) {
      userUpdatePayload.timezone = updateData.timezone;
    }

    const hasProfileUpdates = Object.keys(profileUpdatePayload).length > 0;
    const hasUserUpdates = Object.keys(userUpdatePayload).length > 0;

    if (!hasProfileUpdates && !hasUserUpdates) {
      const profile = await this.getProfile(userId);
      if (!profile) {
        throw new CustomHttpException(
          'Profile not found',
          HttpStatus.NOT_FOUND,
        );
      }
      return profile;
    }

    await this.dataSource.transaction(async (manager) => {
      if (hasProfileUpdates) {
        const updatedProfile = await this.profileModelAction.update({
          updatePayload: profileUpdatePayload,
          identifierOptions: { userId },
          transactionOptions: {
            useTransaction: true,
            transaction: manager,
          },
        });

        if (!updatedProfile) {
          throw new CustomHttpException(
            'Failed to update profile',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }

      if (hasUserUpdates) {
        const updatedUser = await this.userModelAction.update({
          updatePayload: userUpdatePayload,
          identifierOptions: { id: userId },
          transactionOptions: {
            useTransaction: true,
            transaction: manager,
          },
        });

        if (!updatedUser) {
          throw new CustomHttpException(
            'Failed to update user',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }
    });

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
