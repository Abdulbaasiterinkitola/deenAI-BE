import { Injectable } from '@nestjs/common';
import { LocalAuthService } from './services/local.service';
import { GoogleAuthService } from './services/google.service';
import RegisterDto from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

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

  async login(dto: LoginDto) {
    const user = await this.localAuthService.login(dto);

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      success: true,
      message: 'Login successful',
      data: {
        token,
        user,
      },
    };
  }

  async googleLogin(idToken: string) {
    const user = await this.googleAuthService.authenticate(idToken);

    if (!user) {
      throw new Error('Failed to authenticate with Google');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      success: true,
      message: 'Google login successful',
      data: {
        token,
        user,
      },
    };
  }
}
