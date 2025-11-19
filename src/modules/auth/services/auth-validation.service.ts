import { Injectable } from '@nestjs/common';
import { AuthProvider } from '@modules/users/enums';
import { User } from '@modules/users/models/user.model';
import { CustomHttpException } from '@shared/custom.exception';
import { HttpStatus } from '@nestjs/common';

/**
 * Interface for Google token response structure
 */
interface GoogleTokenResponse {
  email: string;
  name?: string;
  picture?: string;
  sub?: string;
  email_verified?: boolean;
  [key: string]: any;
}

/**
 * Service responsible for validating authentication-related data and operations
 * Follows the same pattern as UserValidationService
 */
@Injectable()
export class AuthValidationService {
  /**
   * Validates the structure and required fields of a Google token response
   *
   * @param data - The response data from Google token verification
   * @throws {CustomHttpException} When token structure is invalid or missing required fields
   */
  validateGoogleTokenResponse(data: any): asserts data is GoogleTokenResponse {
    if (!data) {
      throw new CustomHttpException(
        'Invalid Google token: empty response',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (data.error) {
      throw new CustomHttpException(
        `Invalid Google token: ${data.error}`,
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!data.email) {
      throw new CustomHttpException(
        'Invalid Google token: missing email',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new CustomHttpException(
        'Invalid Google token: malformed email',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * Validates that a user's email is present and properly formatted
   *
   * @param email - The email to validate
   * @throws {CustomHttpException} When email is missing or invalid
   */
  validateUserEmail(email: string): void {
    if (!email || typeof email !== 'string') {
      throw new CustomHttpException(
        'Email is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new CustomHttpException(
        'Invalid email format',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Validates for authentication provider conflicts when a user tries to authenticate
   * with a different provider than what's registered in the system
   *
   * @param existingUser - The existing user from the database
   * @param requestedProvider - The authentication provider being requested
   * @throws {CustomHttpException} When there's a provider conflict
   */
  validateAuthProviderConflict(
    existingUser: User | null,
    requestedProvider: AuthProvider,
  ): void {
    if (!existingUser) {
      // No existing user, no conflict
      return;
    }

    if (existingUser.authProvider === requestedProvider) {
      // Same provider, no conflict
      return;
    }

    // Different provider, conflict exists
    throw new CustomHttpException(
      `This account uses ${existingUser.authProvider} authentication. Please sign in with your ${existingUser.authProvider} account.`,
      HttpStatus.CONFLICT,
    );
  }

  /**
   * Validates if a user can be created with the specified authentication provider
   *
   * @param email - The user's email
   * @param authProvider - The authentication provider
   * @param existingUser - The existing user with the same email (if any)
   * @throws {CustomHttpException} When user cannot be created due to conflicts
   */
  validateUserCreation(
    email: string,
    authProvider: AuthProvider,
    existingUser: User | null,
  ): void {
    if (existingUser) {
      if (existingUser.authProvider !== authProvider) {
        throw new CustomHttpException(
          `Email already registered with ${existingUser.authProvider} authentication`,
          HttpStatus.CONFLICT,
        );
      }

      throw new CustomHttpException(
        'User already exists with this authentication provider',
        HttpStatus.CONFLICT,
      );
    }
  }

  /**
   * Validates if a user's authentication provider can be updated
   * This is used when a user initially registered with one provider and wants to use another
   *
   * @param existingUser - The existing user from the database
   * @param newProvider - The new authentication provider
   * @throws {CustomHttpException} When provider update is not allowed
   */
  validateAuthProviderUpdate(
    existingUser: User,
    newProvider: AuthProvider,
  ): void {
    if (existingUser.authProvider === newProvider) {
      throw new CustomHttpException(
        'User already uses this authentication provider',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Only allow transition from LOCAL to OAuth providers
    if (
      existingUser.authProvider !== AuthProvider.LOCAL &&
      newProvider !== AuthProvider.LOCAL
    ) {
      throw new CustomHttpException(
        'Cannot switch between OAuth providers',
        HttpStatus.CONFLICT,
      );
    }
  }
}
