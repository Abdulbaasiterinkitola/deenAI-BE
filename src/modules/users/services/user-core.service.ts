import { Injectable } from '@nestjs/common';
import { UserModelAction } from '../action-models/user.action-model';
import { UserType } from '../types/user';
import UserValidationService from './user-validation.service';
import { AuthProvider } from '../enums';

@Injectable()
export default class UserCoreService {
  constructor(
    private userModelAction: UserModelAction,
    private readonly userValidationService: UserValidationService,
  ) {}

  async createUser(createPayload: UserType) {
    await this.userValidationService.createUserValidation(createPayload);

    // ✅ FIXED — must wrap inside { createPayload: ... }
    await this.userModelAction.create({
      createPayload,
    });

    return {
      success: true,
      message: 'User created successfully.',
    };
  }

  async getUserByEmail(email: string) {
    return await this.userModelAction.get({ email });
  }

  async getUserById(id: string) {
    return await this.userModelAction.getById(id);
  }

  async updateUserPassword(id: string, hashedPassword: string) {
    return await this.userModelAction.updatePassword(id, hashedPassword);
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
}
