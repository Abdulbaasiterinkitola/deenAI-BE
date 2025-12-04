import { Injectable, HttpStatus } from '@nestjs/common';
import { UserModelAction } from '@modules/users/action-models/user.action-model';
import { CustomHttpException } from '@shared/custom.exception';

@Injectable()
export class SuperadminCrudValidator {
  constructor(private userModelAction: UserModelAction) {}

  async validateUserExists(userId: string) {
    const user = await this.userModelAction.get({ id: userId });

    if (!user) {
      throw new CustomHttpException(
        `User with ID ${userId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return user;
  }

  async validateEmailUniqueness(email: string, excludeUserId?: string) {
    const existingUser = await this.userModelAction.get({ email });

    if (existingUser && existingUser.id !== excludeUserId) {
      throw new CustomHttpException(
        `User with email ${email} already exists`,
        HttpStatus.CONFLICT,
      );
    }
  }

  validateNotSelfAction(userId: string, adminUserId: string, action: string) {
    if (userId === adminUserId) {
      throw new CustomHttpException(
        `Cannot ${action} your own account`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  validateUserCanBeActivated(user: any) {
    if (user.status === 'active') {
      throw new CustomHttpException(
        'User is already active',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  validateUserCanBeDeactivated(user: any) {
    if (user.status === 'paused') {
      throw new CustomHttpException(
        'User is already inactive',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  validateUserCanBePromoted(user: any) {
    if (user.isSuperadmin) {
      throw new CustomHttpException(
        'User is already a superadmin',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  validateUserCanBeDemoted(user: any) {
    if (!user.isSuperadmin) {
      throw new CustomHttpException(
        'User is not a superadmin',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
