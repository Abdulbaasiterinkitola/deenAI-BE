import { Injectable } from '@nestjs/common';
import { LocalAuthService } from './services/local.service';
import RegisterDto from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { User } from '../users/models/user.model';

@Injectable()
export class AuthService {
  constructor(private readonly localAuthService: LocalAuthService) {}

  async registerWithEmailAndPassword(dto: RegisterDto) {
    return await this.localAuthService.register(dto);
  }

  async login(
    dto: LoginDto,
  ): Promise<{ success: boolean; message: string; data: { token: string; user: User } }> {
    return await this.localAuthService.login(dto);
  }
}
