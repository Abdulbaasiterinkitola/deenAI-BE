import { Injectable, HttpStatus } from '@nestjs/common';
import { UsersService } from '@modules/users/users.service';
import { ConfigService } from '@nestjs/config';
import { AuthValidationService } from './auth-validation.service';
import { AuthProvider } from '@modules/users/enums';
import { CustomHttpException } from '@shared/custom.exception';
import { normalizeEmail } from '@helpers/email.helper';
import { User } from '@modules/users/models/user.model';
import { JwtPayload, decode, verify } from 'jsonwebtoken';
import { createPublicKey, JsonWebKey as CryptoJwk } from 'crypto';

interface AppleJwtPayload extends JwtPayload {
  email?: string;
  email_verified?: string | boolean;
  sub?: string;
  nonce?: string;
}

interface JwkKey {
  kty: string;
  kid: string;
  use: string;
  alg: string;
  n: string;
  e: string;
}

interface JwksResponse {
  keys: JwkKey[];
}

@Injectable()
export class AppleAuthService {
  private appleKeysCache: JwkKey[] | null = null;
  private readonly APPLE_ISSUER = 'https://appleid.apple.com';

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly authValidationService: AuthValidationService,
  ) {}

  async authenticate(idToken: string): Promise<User> {
    const clientId = this.configService.get<string>('auth.appleClientId');
    if (!clientId) {
      throw new CustomHttpException(
        'Apple authentication not configured',
        HttpStatus.BAD_REQUEST,
      );
    }

    const payload = await this.verifyIdToken(idToken, clientId);
    const normalizedEmail = normalizeEmail(payload.email || '');

    if (!normalizedEmail) {
      throw new CustomHttpException(
        'Apple token is missing email',
        HttpStatus.UNAUTHORIZED,
      );
    }

    this.authValidationService.validateUserEmail(normalizedEmail);

    const existingUser =
      await this.usersService.getUserByEmail(normalizedEmail);

    if (!existingUser) {
      this.authValidationService.validateUserCreation(
        normalizedEmail,
        AuthProvider.APPLE,
        existingUser,
      );

      const userData = {
        name: normalizedEmail.split('@')[0],
        email: normalizedEmail,
        password: '',
        authProvider: AuthProvider.APPLE,
        isEmailVerified: this.isEmailVerifiedFlag(payload.email_verified),
      };

      await this.usersService.createUser(userData);
      const createdUser =
        await this.usersService.getUserByEmail(normalizedEmail);

      if (!createdUser) {
        throw new CustomHttpException(
          'Failed to retrieve created user',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return createdUser;
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
        normalizedEmail,
        AuthProvider.APPLE,
        this.isEmailVerifiedFlag(payload.email_verified),
      );

      return this.usersService.getUserByEmail(normalizedEmail) as Promise<User>;
    }

    return existingUser;
  }

  private isEmailVerifiedFlag(emailVerified: string | boolean | undefined) {
    if (typeof emailVerified === 'boolean') return emailVerified;
    if (typeof emailVerified === 'string')
      return emailVerified.toLowerCase() === 'true';
    return true;
  }

  private async verifyIdToken(
    idToken: string,
    clientId: string,
  ): Promise<AppleJwtPayload> {
    const decoded = decode(idToken, { complete: true });

    if (!decoded || typeof decoded !== 'object' || !decoded.header?.kid) {
      throw new CustomHttpException(
        'Invalid Apple token',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const keys = await this.getAppleKeys();
    const matchingKey = keys.find((key) => key.kid === decoded.header.kid);

    if (!matchingKey) {
      throw new CustomHttpException(
        'Unable to verify Apple token (key mismatch)',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const jwk: CryptoJwk = {
      kty: matchingKey.kty,
      kid: matchingKey.kid,
      use: matchingKey.use,
      alg: matchingKey.alg,
      n: matchingKey.n,
      e: matchingKey.e,
    };

    const publicKey = createPublicKey({
      key: jwk,
      format: 'jwk',
    }).export({ format: 'pem', type: 'spki' });

    const verified = verify(idToken, publicKey, {
      algorithms: ['RS256'],
      audience: clientId,
      issuer: this.APPLE_ISSUER,
    }) as AppleJwtPayload;

    if (!verified || typeof verified !== 'object') {
      throw new CustomHttpException(
        'Invalid Apple token payload',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return verified;
  }

  private async getAppleKeys(): Promise<JwkKey[]> {
    if (this.appleKeysCache) return this.appleKeysCache;

    const response = await fetch('https://appleid.apple.com/auth/keys');
    if (!response.ok) {
      throw new CustomHttpException(
        'Failed to fetch Apple public keys',
        HttpStatus.BAD_GATEWAY,
      );
    }

    const data = (await response.json()) as JwksResponse;
    this.appleKeysCache = data.keys;
    return this.appleKeysCache;
  }
}
