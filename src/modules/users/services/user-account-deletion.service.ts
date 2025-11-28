import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DeletionCodeService } from './deletion-code.service';
import { EmailService } from '@modules/email/email.service';
import { User } from '../models/user.model';
import { CustomHttpException } from '@shared/custom.exception';
import UserCoreService from './user-core.service';

@Injectable()
export class UserAccountDeletionService {
  private readonly logger = new Logger(UserAccountDeletionService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly deletionCodeService: DeletionCodeService,
    private readonly emailService: EmailService,
    private readonly userCoreService: UserCoreService,
  ) {}

  async confirmAccountDeletion(user: User, otp: string) {
    const userEmail = user.email;
    const userName = user.name;
    const userId = user.id;

    await this.dataSource.transaction(async (manager) => {
      const isVerified =
        await this.deletionCodeService.confirmAccountDeletionCodeWithTransaction(
          userId,
          otp,
          userEmail,
          manager,
        );

      if (!isVerified) {
        throw new CustomHttpException(
          'Invalid or expired OTP',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.userCoreService.deleteUser(userId, manager);

      this.logger.log(`User account deleted for user ID: ${userId}`);
    });

    await this.sendDeletionConfirmation(userEmail, userName);

    return {
      success: true,
      message: 'Account deleted successfully',
    };
  }

  private async sendDeletionConfirmation(email: string, name: string) {
    try {
      await this.emailService.sendEmail(
        email,
        'Account Deleted Successfully',
        'account-deletion-complete',
        { name },
      );
      this.logger.log(`Account deletion confirmation email sent to ${email}`);
    } catch (err) {
      this.logger.error(
        `Failed to send account deletion confirmation email to ${email}: ${
          (err as Error).message
        }`,
      );
    }
  }
}
