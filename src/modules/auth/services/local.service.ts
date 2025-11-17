import { UsersService } from '@modules/users/users.service';
import { Injectable } from '@nestjs/common';
import { AuthProvider } from '@modules/users/enums';
import { UserType } from '@modules/users/types/user';
import RegisterDto from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CustomException } from '../../../shared/custom.exception';
import { User } from '../../users/models/user.model';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LocalAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const userData: UserType = {
      name: dto.name,
      email: dto.email,
      password: dto.password,
      authProvider: AuthProvider.LOCAL,
      isEmailVerified: false,
    };
    return await this.usersService.createUser(userData);
  }

  async login(
    dto: LoginDto,
  ): Promise<{ success: boolean; message: string; data: { token: string; user: User } }> {
    const user = await this.usersService.getUserByEmail(dto.email);

    if (!user) {
      throw new CustomException('Invalid login credentials', 401);
    }

    if (user.authProvider !== AuthProvider.LOCAL) {
      throw new CustomException(
        `This account uses ${user.authProvider} authentication. Please sign in with your ${user.authProvider} account.`,
        401,
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new CustomException('Invalid login credentials', 401);
    }

    const token = this.jwtService.sign(
      { sub: user.id, email: user.email },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRATION_TIME'),
      },
    );

    return {
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          identifier: user.identifier,
          name: user.name,
          email: user.email,
          authProvider: user.authProvider,
          isEmailVerified: user.isEmailVerified,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      },
    };
  }
}
