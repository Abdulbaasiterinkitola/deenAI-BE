import { UsersService } from '@modules/users/users.service';
import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthProvider } from '@modules/users/enums';
import { UserType } from '@modules/users/types/user';
import { CustomHttpException } from '@shared/custom.exception';
import { User } from '@modules/users/models/user.model';
import { AuthValidationService } from './auth-validation.service';
import { normalizeEmail } from '@helpers/email.helper';
import { EmailService } from '@modules/email/email.service';

interface AppleTokenResponse {
  email?: string;
  name?: string;
  aud?: string;
  sub?: string;
  error?: string;
  [key: string]: unknown;
}

interface AppleUserData {
  email: string;
  name?: string;
}

@Injectable()
export class AppleAuthService {
  private readonly logger = new Logger(AppleAuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly authValidationService: AuthValidationService,
    private readonly emailService: EmailService,
  ) {}

  async authenticate(token: string): Promise<User> {
    const appleUserData = this.verifyAppleToken(token);
    const user = await this.createOrUpdateUser(appleUserData);

    if (!user) {
      throw new CustomHttpException(
        'Failed to authenticate with Apple',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return user;
  }

  private verifyAppleToken(token: string): AppleUserData {
    try {
      // Apple uses JWT tokens that need to be verified differently
      // For now, we'll use a basic implementation
      // In production, you should verify the JWT signature with Apple's public keys

      const payload = this.decodeJWT(token);

      if (!payload.email) {
        throw new CustomHttpException(
          'Invalid Apple token: missing email',
          401,
        );
      }

      // Validate client ID
      const appleClientId =
        this.configService.get<string>('auth.appleClientId');
      if (appleClientId && payload.aud && payload.aud !== appleClientId) {
        throw new CustomHttpException(
          'Invalid Apple token: client ID mismatch',
          401,
        );
      }

      const email = normalizeEmail(payload.email);
      if (!email) {
        throw new CustomHttpException(
          'Invalid Apple token: invalid email',
          401,
        );
      }

      return {
        email,
        name: payload.name,
      };
    } catch (error) {
      if (error instanceof CustomHttpException) {
        throw error;
      }
      throw new CustomHttpException('Failed to verify Apple token', 401);
    }
  }

  private decodeJWT(token: string): AppleTokenResponse {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64url').toString('utf8'),
      ) as AppleTokenResponse;

      return payload;
    } catch {
      throw new CustomHttpException('Invalid Apple token format', 401);
    }
  }

  private async createOrUpdateUser(
    appleUserData: AppleUserData,
  ): Promise<User | null> {
    const email = normalizeEmail(appleUserData.email);
    if (!email) {
      throw new CustomHttpException('Email is required', 400);
    }
    const { name } = appleUserData;

    this.authValidationService.validateUserEmail(email);

    const existingUser = await this.usersService.getUserByEmail(email);

    if (!existingUser) {
      this.authValidationService.validateUserCreation(
        email,
        AuthProvider.APPLE,
        null,
      );

      const userData: UserType = {
        name: name || email.split('@')[0],
        email,
        password: '',
        authProvider: AuthProvider.APPLE,
        isEmailVerified: true,
      };

      await this.usersService.createUser(userData);
      const newUser = await this.usersService.getUserByEmail(email);
      
      // Send welcome email for new users
      if (newUser) {
        await this.sendWelcomeEmail(newUser);
      }
      
      return newUser;
    }

    this.authValidationService.validateAuthProviderConflict(
      existingUser,
      AuthProvider.APPLE,
    );

    if (existingUser.authProvider === AuthProvider.LOCAL) {
      this.authValidationService.validateAuthProviderUpdate(
        existingUser,
        AuthProvider.APPLE,
      );

      await this.usersService.updateUserAuthProvider(
        email,
        AuthProvider.APPLE,
        true,
      );

      return await this.usersService.getUserByEmail(email);
    }

    if (existingUser.authProvider === AuthProvider.APPLE) {
      return existingUser;
    }

    throw new CustomHttpException(
      `This account uses ${existingUser.authProvider} authentication. Please sign in with your ${existingUser.authProvider} account.`,
      401,
    );
  }

  private async sendWelcomeEmail(user: User): Promise<void> {
    try {
      await this.emailService.sendEmail(
        user.email,
        'Welcome to Deen AI',
        'welcome',
        { name: user.name },
      );
      this.logger.log(`Welcome email sent to new Apple OAuth user: ${user.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to ${user.email}: ${(error as Error).message}`,
      );
      // Don't throw error - user creation should not fail due to email issues
    }
  }
}
