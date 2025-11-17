import { Injectable } from '@nestjs/common';
import { UserModelAction } from '../action-models/user.action-model';
import { UserType } from '../types/user';
import UserValidationService from './user-validation.service';

@Injectable()
export default class UserCoreService {
  constructor(
    private userModelAction: UserModelAction,
    private readonly userValidationService: UserValidationService,
    // priva
  ) {}

  async createUser(createPayload: UserType) {
    await this.userValidationService.createUserValidation(createPayload);
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
}
