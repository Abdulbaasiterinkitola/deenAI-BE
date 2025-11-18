import { UsersService } from '@modules/users/users.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthProvider } from '@modules/users/enums';
import { UserType } from '@modules/users/types/user';
import { CustomHttpException } from '@shared/custom.exception';
import { User } from '@modules/users/models/user.model';
import { AuthValidationService } from './auth-validation.service';

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

  async authenticate(token: string): Promise<User | null> {
    const googleUserData = await this.verifyGoogleToken(token);
    return await this.createOrUpdateUser(googleUserData);
  }

  private async verifyGoogleToken(token: string): Promise<GoogleUserData> {
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

      // Validate client ID if configured
      const googleClientId = this.configService.get<string>(
        'auth.googleClientId',
      );
      if (googleClientId && data.aud && data.aud !== googleClientId) {
        throw new CustomHttpException(
          'Invalid Google token: client ID mismatch',
          401,
        );
      }

      return {
        email: data.email,
        name: data.name,
      };
    } catch (error) {
      if (error instanceof CustomHttpException) {
        throw error;
      }
      throw new CustomHttpException('Failed to verify Google token', 401);
    }
  }

  private async createOrUpdateUser(
    googleUserData: GoogleUserData,
  ): Promise<User | null> {
    const { email, name } = googleUserData;
    
    // Validate email using validation service
    this.authValidationService.validateUserEmail(email);

    const existingUser = await this.usersService.getUserByEmail(email);

    if (!existingUser) {
      // Validate user creation using validation service
      this.authValidationService.validateUserCreation(email, AuthProvider.GOOGLE, null);
      
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
    this.authValidationService.validateAuthProviderConflict(existingUser, AuthProvider.GOOGLE);

    // Update existing user if they were using LOCAL auth before
    if (existingUser.authProvider === AuthProvider.LOCAL) {
      // Validate auth provider update using validation service
      this.authValidationService.validateAuthProviderUpdate(existingUser, AuthProvider.GOOGLE);
      
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
