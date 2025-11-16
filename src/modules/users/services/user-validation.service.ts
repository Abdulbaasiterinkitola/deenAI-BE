import { HttpStatus, Injectable } from '@nestjs/common';
import { UserModelAction } from '../action-models/user.action-model';
import { UserType } from '../types/user';
import { CustomHttpException } from '@shared/custom.exception';

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
}
