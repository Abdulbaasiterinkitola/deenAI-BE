import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileModelAction } from '../profile.model-action';
import { SaveProfileDto } from '../dto/save-profile.dto';
import { CreateProfileDto } from '../dto/create-profile.dto';
import { Profile } from '../models/profile.model';
import { User } from '@modules/users/models/user.model';
import { CustomHttpException } from '@shared/custom.exception';

@Injectable()
export class ProfileCoreService {
  constructor(
    private readonly profileModelAction: ProfileModelAction,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Create a user's profile
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

  // Update a user's profile
  async updateProfile(
    userId: string,
    updateData: SaveProfileDto,
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
    if (updateData.name !== undefined && updatePayload.user) {
      updatePayload.user.name = updateData.name;
    }

    // Handle timezone update (stored in User model, not Profile)
    if (updateData.timezone !== undefined) {
      await this.userRepository.update(userId, {
        timezone: updateData.timezone,
      });
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
