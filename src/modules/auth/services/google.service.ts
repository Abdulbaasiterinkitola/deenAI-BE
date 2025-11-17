import { UsersService } from '@modules/users/users.service';
import { Injectable } from '@nestjs/common';
import { AuthProvider } from '@modules/users/enums';
import { UserType } from '@modules/users/types/user';
import { CustomHttpException } from '@shared/custom.exception';

@Injectable()
export class GoogleAuthService {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  async authenticate(token: string) {
    const googleUserData = await this.verifyGoogleToken(token);
    return await this.createOrUpdateUser(googleUserData);
  }

  private async verifyGoogleToken(token: string) {
    try {
      const tokenInfoUrl = `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`;
      const response = await fetch(tokenInfoUrl);

      if (!response.ok) {
        throw new CustomHttpException('Invalid Google token', 401);
      }

      const data = await response.json();

      if (!data || data.error) {
        throw new CustomHttpException('Invalid Google token', 401);
      }

      return data;
    } catch (error) {
      if (error instanceof CustomHttpException) {
        throw error;
      }
      throw new CustomHttpException('Failed to verify Google token', 401);
    }
  }

  private async createOrUpdateUser(googleUserData: any) {
    const { email, name } = googleUserData;
    
    if (!email) {
      throw new CustomHttpException('Invalid Google token: missing email', 401);
    }

    const existingUser = await this.usersService.getUserByEmail(email);

    if (!existingUser) {
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

    // Update existing user if they were using LOCAL auth before
    if (existingUser.authProvider === AuthProvider.LOCAL) {
      // Update auth provider to GOOGLE
      const userCoreService = (this.usersService as any).userCoreService;
      const userModelAction = (userCoreService as any).userModelAction;
      
      await userModelAction.update({
        updatePayload: {
          authProvider: AuthProvider.GOOGLE,
          isEmailVerified: true, // Google verifies the email
        },
        identifierOptions: { email },
      });

      // Return updated user
      return await this.usersService.getUserByEmail(email);
    }

    // If user already exists with GOOGLE auth, return them
    if (existingUser.authProvider === AuthProvider.GOOGLE) {
      return existingUser;
    }

    // If user exists with another provider (like APPLE), throw error
    throw new CustomHttpException(
      `This account uses ${existingUser.authProvider} authentication. Please sign in with your ${existingUser.authProvider} account.`,
      401,
    );
  }
}