import {
  Injectable,
  HttpStatus,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { LocalAuthService } from './services/local.service';
import { GoogleAuthService } from './services/google.service';
import RegisterDto from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CustomHttpException } from '@shared/custom.exception';
import { UsersService } from '@modules/users/users.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly localAuthService: LocalAuthService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {}

  // Access and Refresh Tokens generation
  private async getTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.configService.get<string>('auth.JWT_SECRET')!,
          expiresIn: '15m', //this.configService.get<string>('auth.JWT_TIMEFRAME',) as any,
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.configService.get<string>('auth.refreshSecret')!,
          expiresIn: '7d', //this.configService.get<string>('auth.refreshExp') as any,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

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
    const tokens = await this.getTokens(user.id, user.email);
    await this.userService.setCurrentRefreshToken(tokens.refreshToken, user.id);
    return {
      success: true,
      message: 'Login successful',
      data: { tokens, user },
    };
  }

  async googleLogin(idToken: string) {
    const user = await this.googleAuthService.authenticate(idToken);
    if (!user) {
      throw new CustomHttpException(
        'Failed to authenticate with Google',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const tokens = await this.getTokens(user.id, user.email);

    return {
      success: true,
      message: 'Google login successful',
      data: { tokens, user },
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('auth.refreshSecret'),
      });

      //Check if the token matches the one in the DB
      const user = await this.userService.getUserIfRefreshTokenMatches(
        refreshToken,
        payload.sub,
      );

      if (!user) {
        throw new ForbiddenException('Access Denied');
      }

      // Rotate Tokens (Generate new pair)
      const tokens = await this.getTokens(user.id, user.email);

      //Update DB with new Refresh Token
      await this.userService.setCurrentRefreshToken(
        tokens.refreshToken,
        user.id,
      );

      return {
        success: true,
        message: 'Tokens refreshed successfully',
        data: tokens,
      };
    } catch (e) {
      throw new UnauthorizedException(`Invalid or Expired Refresh Token ${e}`);
    }
  }

  async logout(userId: string) {
    await this.userService.removeRefreshToken(userId);
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}
