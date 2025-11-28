import { ForbiddenException, HttpStatus, Injectable } from '@nestjs/common';
import { UserModelAction } from '../action-models/user.action-model';
import { UserType } from '../types/user';
import { CustomHttpException } from '@shared/custom.exception';
import { User } from '../models/user.model';

import * as bcrypt from 'bcrypt';
import { EntityManager } from 'typeorm';
import { normalizeEmail } from '@helpers/email.helper';
import { UserStatus } from '../enums/user-status.enum';

@Injectable()
export default class UserValidationService {
  constructor(private userModelAction: UserModelAction) {}

  normalizeAndValidateEmail(email: string): string {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      throw new CustomHttpException(
        'Email is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    return normalizedEmail;
  }

  async createUserValidation(createPayload: UserType) {
    const userExists = await this.userModelAction.get({
      email: createPayload.email,
    });

    if (userExists) {
      throw new CustomHttpException(
        'An account with this email already exists. Please try logging in instead.',
        HttpStatus.CONFLICT,
      );
    }
  }

  async validateRefreshTokenMatch(
    refreshToken: string,
    user: Pick<User, 'id' | 'email' | 'currentRefreshToken'> | null,
  ): Promise<Pick<User, 'id' | 'email'>> {
    if (!user || !user.currentRefreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentRefreshToken,
    );

    if (!isRefreshTokenMatching) {
      throw new ForbiddenException('Access Denied');
    }

    return {
      id: user.id,
      email: user.email,
    };
  }

  async validateUserForLogin(
    email: string,
    passwordAttempt: string,
  ): Promise<User> {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      throw new CustomHttpException(
        'Email is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.userModelAction.get({ email: normalizedEmail });

    if (!user) {
      throw new CustomHttpException(
        'Invalid email or password. Please check your credentials and try again.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Check if user has a password (was originally LOCAL or has set a password)
    if (!user.password || user.password === '') {
      throw new CustomHttpException(
        `This account was created with ${user.authProvider} authentication. Please sign in with your ${user.authProvider} account or set a password first.`,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isPasswordMatch = await bcrypt.compare(
      passwordAttempt,
      user.password,
    );

    if (!isPasswordMatch) {
      throw new CustomHttpException(
        'Invalid email or password. Please check your credentials and try again.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return user;
  }

  async validateUserExists(userId: string, transaction?: EntityManager) {
    const user = transaction
      ? await transaction.findOne(User, { where: { id: userId } })
      : await this.userModelAction.get({ id: userId });
    if (!user) {
      throw new CustomHttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  async validateUserCanBePaused(userId: string): Promise<User> {
    const user = await this.userModelAction.get({ id: userId });

    if (!user) {
      throw new CustomHttpException(
        'User account not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (user.status === UserStatus.PAUSED) {
      throw new CustomHttpException(
        'Account is already paused',
        HttpStatus.BAD_REQUEST,
      );
    }
    return user;
  }

  async validateUserCanBeReactivated(userId: string): Promise<User> {
    const user = await this.userModelAction.get({ id: userId });

    if (!user) {
      throw new CustomHttpException(
        'User account not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (user.status === UserStatus.ACTIVE) {
      throw new CustomHttpException(
        'Account is already active',
        HttpStatus.BAD_REQUEST,
      );
    }
    return user;
  }
}
