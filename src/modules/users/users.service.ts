import { Injectable, Logger } from '@nestjs/common';
import UserCoreService from './services/user-core.service';
import { UserType } from './types/user';
import { AuthProvider } from './enums';
import { User } from './models/user.model';
import { DeletionCodeService } from './services/deletion-code.service';
import { EmailService } from '@modules/email/email.service';
import { PlansService } from '@modules/plans/plans.service';
import { Plan } from '@modules/plans/models/plan.model';
import UserValidationService from './services/user-validation.service';
import { UserRegistrationService } from './services/user-registration.service';
import { UserSessionService } from './services/user-session.service';
import { UserAccountDeletionService } from './services/user-account-deletion.service';
@Injectable()
export class UsersService {
  logger = new Logger(UsersService.name);
  constructor(
    private readonly userCoreService: UserCoreService,
    private readonly deletionCodeService: DeletionCodeService,
    private readonly emailService: EmailService,
    private readonly plansService: PlansService,
    private readonly userValidationService: UserValidationService,
    private readonly userRegistrationService: UserRegistrationService,
    private readonly userSessionService: UserSessionService,
    private readonly userAccountDeletionService: UserAccountDeletionService,
  ) {}

  async createUser(user: UserType) {
    await this.userRegistrationService.createUser(user);
  }

  async getUserByEmail(email: string) {
    const normalizedEmail =
      this.userValidationService.normalizeAndValidateEmail(email);
    return await this.userCoreService.getUserByEmail(normalizedEmail);
  }
  async getUserById(id: string) {
    return await this.userCoreService.getUserById(id);
  }

  async updateUserPassword(id: string, hashedPassword: string) {
    return await this.userCoreService.updateUserPassword(id, hashedPassword);
  }

  async markEmailAsVerified(email: string) {
    const normalizedEmail =
      this.userValidationService.normalizeAndValidateEmail(email);
    return await this.userCoreService.markEmailAsVerified(normalizedEmail);
  }

  async updateUserAuthProvider(
    email: string,
    authProvider: AuthProvider,
    isEmailVerified: boolean,
  ) {
    const normalizedEmail =
      this.userValidationService.normalizeAndValidateEmail(email);

    return await this.userCoreService.updateUserAuthProvider(
      normalizedEmail,
      authProvider,
      isEmailVerified,
    );
  }

  async updateUserName(email: string, name: string) {
    const normalizedEmail =
      this.userValidationService.normalizeAndValidateEmail(email);

    return await this.userCoreService.updateUserName(normalizedEmail, name);
  }

  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    await this.userSessionService.setCurrentRefreshToken(refreshToken, userId);
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    return await this.userSessionService.getUserIfRefreshTokenMatches(
      refreshToken,
      userId,
    );
  }

  async removeRefreshToken(userId: string) {
    return this.userSessionService.removeRefreshToken(userId);
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
    return await this.userAccountDeletionService.confirmAccountDeletion(
      user,
      otp,
    );
  }

  async getUserPlan(userId: string): Promise<Plan | null> {
    const user = await this.userCoreService.getUserById(userId);
    if (!user || !user.planId) {
      return null;
    }
    return (await this.plansService.getPlanById(user.planId)) as Plan;
  }

  /**
   * Update specific user fields
   */
  async updateUserFields(userId: string, fields: Partial<User>) {
    return await this.userCoreService.updateUserFields(userId, fields);
  }

  async incrementFailedAttempts(userId: string) {
    return await this.userCoreService.incrementFailedAttempts(userId);
  }
}
