import { Injectable } from '@nestjs/common';
import { LocalAuthService } from './services/local.service';
import RegisterDto from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
@Injectable()
export class AuthService {
  constructor(private readonly localAuthService: LocalAuthService) {}

  async registerWithEmailAndPassword(dto: RegisterDto) {
    return await this.localAuthService.register(dto);
  }

  async login(dto: LoginDto) {
    return await this.localAuthService.login(dto);
  }
}
