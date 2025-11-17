import { Injectable } from '@nestjs/common';
import { LocalAuthService } from './services/local.service';
import RegisterDto from './dtos/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly localAuthService: LocalAuthService) {}

  async registerWithEmailAndPassword(dto: RegisterDto) {
    return await this.localAuthService.register(dto);
  }
}
