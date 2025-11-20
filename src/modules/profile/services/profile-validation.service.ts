import { Injectable, HttpStatus } from '@nestjs/common';
import { ProfileModelAction } from '../profile.model-action';
import { CustomHttpException } from '@shared/custom.exception';

@Injectable()
export class ProfileValidationService {
  constructor(private readonly profileModelAction: ProfileModelAction) {}

  // Ensure a user does not already have a profile
  async validateProfileDoesNotExist(userId: string) {
    const exists = await this.profileModelAction.exists({ userId });

    if (exists) {
      throw new CustomHttpException(
        { message: 'Profile already exists' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Check if a profile exists for a user
  async validateProfileExists(userId: string) {
    const profile = await this.profileModelAction.get({ userId });

    if (!profile) {
      throw new CustomHttpException(
        { message: 'Profile not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    return profile;
  }

  // Check if username is already taken by another user
  async validateUsernameUnique(username: string, currentUserId: string) {
    if (!username) return;

    const existingProfile = await this.profileModelAction.get({
      username: username.toLowerCase(),
    });

    // If a profile with this username exists and it's not the current user's profile
    if (existingProfile && existingProfile.userId !== currentUserId) {
      throw new CustomHttpException(
        { message: 'Username already exists' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
