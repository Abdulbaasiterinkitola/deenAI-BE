import { UsersService } from '@modules/users/users.service';
import { Injectable, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthProvider } from '@modules/users/enums';
import { UserType } from '@modules/users/types/user';
import { CustomHttpException } from '@shared/custom.exception';
import { User } from '@modules/users/models/user.model';
import { AuthValidationService } from './auth-validation.service';
import { normalizeEmail } from '@helpers/email.helper';

interface GoogleTokenResponse {
  email?: string;
  name?: string;
  aud?: string; // Audience (Client ID)
  error?: string;
  [key: string]: unknown;
}

interface GoogleUserData {
  email: string;
  name?: string;
}

@Injectable()
export class GoogleAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly authValidationService: AuthValidationService,
  ) {}

  async authenticate(token: string, platform?: string): Promise<User> {
    const googleUserData = await this.verifyGoogleToken(token, platform);
    const user = await this.createOrUpdateUser(googleUserData);

    if (!user) {
      throw new CustomHttpException(
        'Failed to authenticate with Google',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return user;
  }

  private async verifyGoogleToken(
    token: string,
    platform?: string,
  ): Promise<GoogleUserData> {
    try {
      const tokenInfoUrl = `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`;
      const response = await fetch(tokenInfoUrl);

      if (!response.ok) {
        throw new CustomHttpException('Invalid Google token', 401);
      }

      const data = (await response.json()) as GoogleTokenResponse;

      // Validate token structure using validation service
      this.authValidationService.validateGoogleTokenResponse(data);

      if (!data.email) {
        throw new CustomHttpException(
          'Invalid Google token: missing email',
          401,
        );
      }

      // Validate client ID against all configured client IDs
      this.validateClientId(data.aud as string, platform);

      const email = normalizeEmail(data.email);
      if (!email) {
        throw new CustomHttpException(
          'Invalid Google token: missing email',
          401,
        );
      }

      return {
        email,
        name: data.name,
      };
    } catch (error) {
      if (error instanceof CustomHttpException) {
        throw error;
      }
      throw new CustomHttpException('Failed to verify Google token', 401);
    }
  }

  private validateClientId(tokenAudience?: string, platform?: string): void {
    if (!tokenAudience) {
      throw new CustomHttpException(
        'Invalid Google token: missing audience',
        401,
      );
    }

    // Get all valid client IDs
    const clientIds = {
      web: this.configService.get<string>('auth.googleClientId'),
      android: this.configService.get<string>('auth.androidClientId'),
      ios: this.configService.get<string>('auth.appleClientId'),
    };

    const validClientIds = Object.values(clientIds).filter(Boolean);

    if (validClientIds.length === 0) {
      throw new CustomHttpException(
        'No OAuth client IDs configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // If platform is specified, validate against specific client ID
    if (platform && clientIds[platform as keyof typeof clientIds]) {
      const expectedClientId = clientIds[platform as keyof typeof clientIds];
      if (tokenAudience !== expectedClientId) {
        throw new CustomHttpException(
          `Invalid Google token: client ID mismatch for ${platform} platform`,
          401,
        );
      }
      return;
    }

    // Otherwise, validate against all configured client IDs
    if (!validClientIds.includes(tokenAudience)) {
      throw new CustomHttpException(
        'Invalid Google token: client ID not recognized',
        401,
      );
    }
  }

  private async createOrUpdateUser(
    googleUserData: GoogleUserData,
  ): Promise<User | null> {
    const email = normalizeEmail(googleUserData.email);
    if (!email) {
      throw new CustomHttpException('Email is required', 400);
    }
    const { name } = googleUserData;

    // Validate email using validation service
    this.authValidationService.validateUserEmail(email);

    const existingUser = await this.usersService.getUserByEmail(email);

    if (!existingUser) {
      // Validate user creation using validation service
      this.authValidationService.validateUserCreation(
        email,
        AuthProvider.GOOGLE,
        null,
      );

      // Create new user with Google auth
      const userData: UserType = {
        name: name || email.split('@')[0], // Use name from Google or email prefix
        email,
        password: '', // No password for OAuth users
        authProvider: AuthProvider.GOOGLE,
        isEmailVerified: true, // Google verifies the email
      };

      await this.usersService.createUser(userData);
      return await this.usersService.getUserByEmail(email);
    }

    // Check for auth provider conflicts using validation service
    this.authValidationService.validateAuthProviderConflict(
      existingUser,
      AuthProvider.GOOGLE,
    );

    // Update existing user if they were using LOCAL auth before
    if (existingUser.authProvider === AuthProvider.LOCAL) {
      // Validate auth provider update using validation service
      this.authValidationService.validateAuthProviderUpdate(
        existingUser,
        AuthProvider.GOOGLE,
      );

      // Update auth provider to GOOGLE
      await this.usersService.updateUserAuthProvider(
        email,
        AuthProvider.GOOGLE,
        true, // Google verifies the email
      );

      // Return updated user
      return await this.usersService.getUserByEmail(email);
    }

    // If user already exists with GOOGLE auth, return them
    if (existingUser.authProvider === AuthProvider.GOOGLE) {
      return existingUser;
    }

    // This should theoretically never be reached due to the validateAuthProviderConflict check above
    throw new CustomHttpException(
      `This account uses ${existingUser.authProvider} authentication. Please sign in with your ${existingUser.authProvider} account.`,
      401,
    );
  }
}
