import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '@modules/users/users.service';

@Injectable()
export class AccountLockingService {
  private readonly logger = new Logger(AccountLockingService.name);

  // Configuration
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCK_DURATION_MINUTES = 30;

  constructor(private readonly usersService: UsersService) {}

  /**
   * Check if account is currently locked
   */
  async isAccountLocked(userId: string): Promise<boolean> {
    const user = await this.usersService.getUserById(userId);

    if (!user || !user.accountLockedUntil) {
      return false;
    }

    const now = new Date();
    const lockExpiry = new Date(user.accountLockedUntil);

    // Check if lock has expired
    if (now >= lockExpiry) {
      // Lock expired, unlock the account
      await this.unlockAccount(userId);
      return false;
    }

    // Account is still locked
    return true;
  }

  /**
   * Get remaining lock time in minutes
   */
  async getRemainingLockTime(userId: string): Promise<number | null> {
    const user = await this.usersService.getUserById(userId);

    if (!user || !user.accountLockedUntil) {
      return null;
    }

    const now = new Date();
    const lockExpiry = new Date(user.accountLockedUntil);

    if (now >= lockExpiry) {
      return 0;
    }

    const diffMs = lockExpiry.getTime() - now.getTime();
    const diffMinutes = Math.ceil(diffMs / (1000 * 60));

    return diffMinutes;
  }

  /**
   * Record failed login attempt
   */
  async recordFailedLogin(userId: string): Promise<void> {
    const user = await this.usersService.getUserById(userId);

    if (!user) {
      return;
    }

    const newAttempts = (user.failedLoginAttempts || 0) + 1;

    this.logger.warn(
      `Failed login attempt ${newAttempts}/${this.MAX_FAILED_ATTEMPTS} for user ${user.email}`,
    );

    // Check if we need to lock the account
    if (newAttempts >= this.MAX_FAILED_ATTEMPTS) {
      await this.lockAccount(userId);
    } else {
      /* Just increment the counter
      await this.usersService.updateUserFields(userId, {
        failedLoginAttempts: newAttempts,
        lastFailedLogin: new Date(),
      });
      */
      await this.usersService.incrementFailedAttempts(userId);
    }
  }

  /**
   * Lock the account
   */
  async lockAccount(userId: string): Promise<void> {
    const lockUntil = new Date();
    lockUntil.setMinutes(lockUntil.getMinutes() + this.LOCK_DURATION_MINUTES);

    await this.usersService.updateUserFields(userId, {
      failedLoginAttempts: this.MAX_FAILED_ATTEMPTS,
      accountLockedUntil: lockUntil,
      lastFailedLogin: new Date(),
    });

    const user = await this.usersService.getUserById(userId);
    this.logger.error(
      `Account locked for user ${user?.email} until ${lockUntil.toISOString()}`,
    );
  }

  /**
   * Unlock the account and reset attempts
   */
  async unlockAccount(userId: string): Promise<void> {
    await this.usersService.updateUserFields(userId, {
      failedLoginAttempts: 0,
      accountLockedUntil: null,
      lastFailedLogin: null,
    });

    const user = await this.usersService.getUserById(userId);
    this.logger.log(`Account unlocked for user ${user?.email}`);
  }

  /**
   * Reset failed attempts (called on successful login)
   */
  async resetFailedAttempts(userId: string): Promise<void> {
    await this.usersService.updateUserFields(userId, {
      failedLoginAttempts: 0,
      lastFailedLogin: null,
    });
  }

  /**
   * Get account lock status details
   */
  async getAccountLockStatus(userId: string): Promise<{
    isLocked: boolean;
    failedAttempts: number;
    remainingMinutes: number | null;
    maxAttempts: number;
  }> {
    const user = await this.usersService.getUserById(userId);
    const isLocked = await this.isAccountLocked(userId);
    const remainingMinutes = await this.getRemainingLockTime(userId);

    return {
      isLocked,
      failedAttempts: user?.failedLoginAttempts || 0,
      remainingMinutes,
      maxAttempts: this.MAX_FAILED_ATTEMPTS,
    };
  }
}
