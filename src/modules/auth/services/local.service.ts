import { UsersService } from '@modules/users/users.service';
import { Injectable } from '@nestjs/common';
import { AuthProvider } from '@modules/users/enums';
import { UserType } from '@modules/users/types/user';
import RegisterDto from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { CustomHttpException } from '@shared/custom.exception';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserResponseDto } from '../../users/dtos/user-response.dto';

@Injectable()
export class LocalAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const userData: UserType = {
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      authProvider: AuthProvider.LOCAL,
      isEmailVerified: false,
    };
    return await this.usersService.createUser(userData);
  }

  async login(
    dto: LoginDto,
  ): Promise<{ success: boolean; message: string; data: { token: string; user: UserResponseDto } }> {
    const user = await this.usersService.getUserByEmail(dto.email);

    if (!user) {
      throw new CustomHttpException('Invalid login credentials', 401);
    }

    if (user.authProvider !== AuthProvider.LOCAL) {
      throw new CustomHttpException(
        `This account uses ${user.authProvider} authentication. Please sign in with your ${user.authProvider} account.`,
        401,
      );
    }

    const isPasswordMatch = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordMatch) {
      throw new CustomHttpException('Invalid login credentials', 401);
    }

    const token = this.jwtService.sign(
      { sub: user.id, email: user.email },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRATION_TIME'),
      },
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return {
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: userWithoutPassword,
      },
    };
  }
}
