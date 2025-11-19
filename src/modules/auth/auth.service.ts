import { Injectable, HttpStatus } from '@nestjs/common';
import { LocalAuthService } from './services/local.service';
import { GoogleAuthService } from './services/google.service';
import RegisterDto from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CustomHttpException } from '@shared/custom.exception';

@Injectable()
export class AuthService {
  constructor(
    private readonly localAuthService: LocalAuthService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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
    return await this.localAuthService.login(dto);
  }

  async googleLogin(idToken: string) {
    const user = await this.googleAuthService.authenticate(idToken);
    if (!user) {
      throw new CustomHttpException(
        'Failed to authenticate with Google',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      success: true,
      message: 'Google login successful',
      data: { token, user },
    };
  }
}
