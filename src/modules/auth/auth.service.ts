import { Injectable } from '@nestjs/common';
import { LocalAuthService } from './services/local.service';
import { GoogleAuthService } from './services/google.service';
import RegisterDto from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
@Injectable()
export class AuthService {
<<<<<<< HEAD
  constructor(private readonly localAuthService: LocalAuthService) {}
=======
  constructor(
    private readonly localAuthService: LocalAuthService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
>>>>>>> 7b5622d97bcab8e39188d86b8dfa5e08e04dbdf4

  async registerWithEmailAndPassword(dto: RegisterDto) {
    return await this.localAuthService.register(dto);
  }

  async login(dto: LoginDto) {
    return await this.localAuthService.login(dto);
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
