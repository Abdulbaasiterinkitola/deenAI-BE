import { Injectable } from '@nestjs/common';
import { LocalAuthService } from './services/local.service';
import RegisterDto from './dtos/register.dto';
import { ForgotPasswordDto } from './dtos/forgotPassword.dto';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly localAuthService: LocalAuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async registerWithEmailAndPassword(dto: RegisterDto) {
    return await this.localAuthService.register(dto);
  }

  async forgotPassword(dto: ForgotPasswordDto, referer?: string) {
    const payload = { email: dto.email, purpose: 'reset-password' };
    const token = this.jwtService.sign(payload, { expiresIn: '1h' });
    return await this.localAuthService.forgotPassword(dto, token, referer);
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
}
