import { HttpStatus, Injectable } from '@nestjs/common';
import { UserModelAction } from '../action-models/user.action-model';
import { UserType } from '../types/user';
import { CustomHttpException } from '@shared/custom.exception';
import { User } from '../models/user.model';
import { AuthProvider } from '../enums';
import * as bcrypt from 'bcrypt';
import { EntityManager } from 'typeorm';
import { normalizeEmail } from '@helpers/email.helper';

@Injectable()
export default class UserValidationService {
  constructor(private userModelAction: UserModelAction) {}

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

    if (user.authProvider !== AuthProvider.LOCAL) {
      throw new CustomHttpException(
        `This account uses ${user.authProvider} authentication. Please sign in with your ${user.authProvider} account.`,
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
}
