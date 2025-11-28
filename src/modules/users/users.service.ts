import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import UserCoreService from './services/user-core.service';
import { UserType } from './types/user';
import { AuthProvider } from './enums';
import { DataSource, Repository } from 'typeorm';
import { User } from './models/user.model';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { NotificationSettingsService } from '@modules/notification-settings/notification-settings.service';
import { CustomHttpException } from '@shared/custom.exception';
import { normalizeEmail } from '@helpers/email.helper';
import { DeletionCodeService } from './services/deletion-code.service';
import { EmailService } from '@modules/email/email.service';
import { PlansService } from '@modules/plans/plans.service';
import { Plan } from '@modules/plans/models/plan.model';
import UserValidationService from './services/user-validation.service';
import { UserModelAction } from './action-models/user.action-model';
@Injectable()
export class UsersService {
  logger = new Logger(UsersService.name);
  constructor(
    private readonly userCoreService: UserCoreService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly notificationSettingsService: NotificationSettingsService,
    private readonly deletionCodeService: DeletionCodeService,
    private readonly emailService: EmailService,
    private readonly dataSource: DataSource,
    private readonly plansService: PlansService,
    private readonly userValidationService: UserValidationService,
    private readonly userModelAction: UserModelAction,
  ) {}

  async createUser(user: UserType) {
    const email = normalizeEmail(user.email);
    if (!email) {
      throw new CustomHttpException(
        'Email is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const normalizedUser: UserType = { ...user, email };

    // This is your refactored, correct implementation.
    await this.userRepo.manager.transaction(async (manager) => {
      // Directly create the user entity
      const userEntity = this.userRepo.create(normalizedUser);
      const savedUser = await manager.save(userEntity);

      // Create notification settings for the new user
      await this.notificationSettingsService.createUserNotificationSettings(
        savedUser.id,
        manager,
      );

      // Assign the free plan
      const freePlan = await this.getFreePlan();
      if (freePlan?.id) {
        await manager.update(User, savedUser.id, { planId: freePlan.id });
      }
    });
  }

  private async getFreePlan(): Promise<Plan | null> {
    return this.plansService.getBySlug('free');
  }

  async getUserByEmail(email: string) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      throw new CustomHttpException(
        'Email is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.userCoreService.getUserByEmail(normalizedEmail);
  }
  async getUserById(id: string) {
    return await this.userCoreService.getUserById(id);
  }

  async updateUserPassword(id: string, hashedPassword: string) {
    return await this.userCoreService.updateUserPassword(id, hashedPassword);
  }

  async markEmailAsVerified(email: string) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      throw new CustomHttpException(
        'Email is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.userCoreService.markEmailAsVerified(normalizedEmail);
  }

  async updateUserAuthProvider(
    email: string,
    authProvider: AuthProvider,
    isEmailVerified: boolean,
  ) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      throw new CustomHttpException(
        'Email is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.userCoreService.updateUserAuthProvider(
      normalizedEmail,
      authProvider,
      isEmailVerified,
    );
  }

  async updateUserName(email: string, name: string) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      throw new CustomHttpException(
        'Email is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.userCoreService.updateUserName(normalizedEmail, name);
  }

  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    const currentRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepo.update(userId, {
      currentRefreshToken,
    });
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'email', 'currentRefreshToken'],
    });

    if (!user) {
      throw new ForbiddenException('Access Denied');
    }

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentRefreshToken || '',
    );

    if (!isRefreshTokenMatching) {
      throw new ForbiddenException('Access Denied');
    }

    return user;
  }

  async removeRefreshToken(userId: string) {
    return this.userRepo.update(userId, {
      currentRefreshToken: null,
    });
  }

  async requestAccountDeletion(user: User) {
    // Generate deletion code
    const deletionCode =
      await this.deletionCodeService.generateAccountDeletionCode(
        user.id,
        user.email,
      );
    // Send email with OTP

    try {
      await this.emailService.sendEmail(
        user.email,
        'Account Deletion Request',
        'account-deletion',
        { otp: deletionCode },
      );
      this.logger.log(`Account deletion OTP email sent to ${user.email}`);
    } catch (err) {
      this.logger.error(
        `Failed to send account deletion OTP email to ${user.email}: ${
          (err as Error).message
        }`,
      );
    }
    // return response
    return { success: true, message: 'Account deletion OTP sent to email' };
  }

  async confirmAccountDeletion(user: User, otp: string) {
    // Store user data for email before deletion
    const userEmail = user.email;
    const userName = user.name;
    const userId = user.id;

    // Use transaction to ensure atomicity
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      // Verify and consume deletion code within transaction
      const isVerified =
        await this.deletionCodeService.confirmAccountDeletionCodeWithTransaction(
          userId,
          otp,
          userEmail,
          transactionalEntityManager,
        );

      if (!isVerified) {
        throw new CustomHttpException(
          'Invalid or expired OTP',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Delete user notification settings within transaction
      await this.notificationSettingsService.deleteUserNotificationSettingsWithTransaction(
        userId,
        transactionalEntityManager,
      );

      // Delete user account within transaction
      await transactionalEntityManager.delete(User, userId);

      this.logger.log(`User account deleted for user ID: ${userId}`);
    });

    // Send account deletion confirmation email (outside transaction)
    // This is non-critical and should not rollback the deletion if it fails
    try {
      await this.emailService.sendEmail(
        userEmail,
        'Account Deleted Successfully',
        'account-deletion-complete',
        { name: userName },
      );
      this.logger.log(
        `Account deletion confirmation email sent to ${userEmail}`,
      );
    } catch (err) {
      this.logger.error(
        `Failed to send account deletion confirmation email to ${userEmail}: ${
          (err as Error).message
        }`,
      );
    }

    return {
      success: true,
      message: 'Account deleted successfully',
    };
  }

  async getUserPlan(userId: string): Promise<Plan | null> {
    const user = await this.userCoreService.getUserById(userId);
    if (!user || !user.planId) {
      return null;
    }
    return (await this.plansService.getPlanById(user.planId)) as Plan;
  }
}
