import { Injectable } from '@nestjs/common';
import { LocalAuthService } from './services/local.service';
import RegisterDto from './dtos/register.dto';
import { JwtService } from '@nestjs/jwt';
import { ForgotPasswordDto } from './dtos/forgotPassword.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly localAuthService: LocalAuthService,
    private readonly jwtService: JwtService,
    // private readonly emailService: EmailService,
  ) {}

  async registerWithEmailAndPassword(dto: RegisterDto) {
    return await this.localAuthService.register(dto);
  }

  async forgotPassword(dto: ForgotPasswordDto, referer?: string) {
    const payload = { email: dto.email, purpose: 'reset-password' };
    const token = this.jwtService.sign(payload, { expiresIn: '1h' });
    return await this.localAuthService.forgotPassword(dto, token, referer);
  }
}
