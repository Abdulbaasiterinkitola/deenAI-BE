import { Injectable } from '@nestjs/common';
import { UserModelAction } from '../action-models/user.action-model';
import { UserType } from '../types/user';
import UserValidationService from './user-validation.service';
import { AuthProvider } from '../enums';
import { EntityManager } from 'typeorm';

@Injectable()
export default class UserCoreService {
  constructor(
    private userModelAction: UserModelAction,
    private readonly userValidationService: UserValidationService,
  ) {}

  async createUser(createPayload: UserType, transaction?: EntityManager) {
    await this.userValidationService.createUserValidation(createPayload);

    const createdUser = await this.userModelAction.create({
      createPayload,
      ...(transaction
        ? {
            transactionOptions: {
              useTransaction: true,
              transaction,
            },
          }
        : {}),
    });

    return {
      success: true,
      message: 'User created successfully.',
      data: createdUser,
    };
  }

  async getUserByEmail(email: string) {
    return await this.userModelAction.get({ email });
  }

  async getUserById(id: string) {
    return await this.userModelAction.get({ id });
  }

  async updateUserPassword(id: string, hashedPassword: string) {
    return await this.userModelAction.update({
      updatePayload: { password: hashedPassword },
      identifierOptions: { id },
    });
  }

  async updateUserAuthProvider(
    email: string,
    authProvider: AuthProvider,
    isEmailVerified: boolean,
  ) {
    return await this.userModelAction.update({
      updatePayload: {
        authProvider,
        isEmailVerified,
      },
      identifierOptions: { email },
    });
  }

  async markEmailAsVerified(email: string) {
    return await this.userModelAction.update({
      updatePayload: { isEmailVerified: true },
      identifierOptions: { email },
    });
  }
}
