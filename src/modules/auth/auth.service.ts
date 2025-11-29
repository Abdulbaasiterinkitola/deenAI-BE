import { Injectable, HttpStatus } from '@nestjs/common';
import { LocalAuthService } from './services/local.service';
import { GoogleAuthService } from './services/google.service';
import { AppleAuthService } from './services/apple.service';
import { TokenService } from './services/token.service';
import RegisterDto from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@modules/users/users.service';
import { CustomHttpException } from '@shared/custom.exception';
@Injectable()
export class AuthService {
  constructor(
    private readonly localAuthService: LocalAuthService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly appleAuthService: AppleAuthService,
    private readonly tokenService: TokenService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {}

  async registerWithEmailAndPassword(dto: RegisterDto) {
    return await this.localAuthService.register(dto);
  }

  async requestOtp(dto: { email: string }) {
    return await this.localAuthService.requestPasswordReset(dto);
  }

  async verifyOtp(dto: { email: string; otp: string }) {
    return await this.localAuthService.verifyOtp(dto);
  }

  async resetPassword(dto: {
    email: string;
    otp: string;
    newPassword: string;
  }) {
    return await this.localAuthService.resetPasswordWithOtp(dto);
  }

  async login(dto: LoginDto) {
    const result = await this.localAuthService.login(dto);
    const user = result.data.user;
    const tokens = await this.tokenService.generateTokens(user.id, user.email);
    await this.userService.setCurrentRefreshToken(tokens.refreshToken, user.id);
    return { tokens, user };
  }

  async googleLogin(idToken: string, platform?: string) {
    const user = await this.googleAuthService.authenticate(idToken, platform);
    const tokens = await this.tokenService.generateTokens(user.id, user.email);

    return { tokens, user };
  }

  async appleLogin(idToken: string) {
    const user = await this.appleAuthService.authenticate(idToken);
    const tokens = await this.tokenService.generateTokens(user.id, user.email);

    return { tokens, user };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('auth.refreshSecret'),
      });

      const user = await this.userService.getUserIfRefreshTokenMatches(
        refreshToken,
        payload.sub as string,
      );

      // Rotate Tokens (Generate new pair)
      const tokens = await this.tokenService.generateTokens(
        user.id,
        user.email,
      );

      //Update DB with new Refresh Token
      await this.userService.setCurrentRefreshToken(
        tokens.refreshToken,
        user.id,
      );

      return tokens;
    } catch (e) {
      throw new CustomHttpException(
        `Invalid or Expired Refresh Token ${e}`,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async logout(userId: string) {
    await this.userService.removeRefreshToken(userId);
    return { message: 'Logged out successfully' };
  }
}
