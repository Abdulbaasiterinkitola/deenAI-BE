import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class GenerateJwtCommand {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateSecret(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  generateToken(
    userId: string = 'test-user',
    email: string = 'test@example.com',
    expiresIn: string = '1h',
  ): string {
    const payload = {
      sub: userId,
      email: email,
      iat: Math.floor(Date.now() / 1000),
    };

    return this.jwtService.sign(payload, {
      expiresIn,
      secret:
        this.configService.get<string>('auth.jwtSecret') || 'fallback-secret',
    } as any);
  }
}
