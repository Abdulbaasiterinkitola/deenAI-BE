import { HttpStatus, Injectable } from '@nestjs/common';
import { UserModelAction } from '../action-models/user.action-model';
import { UserType } from '../types/user';
import { CustomHttpException } from '@shared/custom.exception';
import { User } from '../models/user.model';
import { AuthProvider } from '../enums';
import * as bcrypt from 'bcrypt';

@Injectable()
export default class UserValidationService {
  constructor(private userModelAction: UserModelAction) {}

  async createUserValidation(createPayload: UserType) {
    const userExists = await this.userModelAction.get({
      email: createPayload.email,
    });

    if (userExists) {
      throw new CustomHttpException(
        'Email already registered',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async validateUserForLogin(
    email: string,
    passwordAttempt: string,
  ): Promise<User> {
    const user = await this.userModelAction.get({ email });

    if (!user) {
      throw new CustomHttpException(
        'Invalid login credentials',
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
        'Invalid login credentials',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return user;
  }
}
