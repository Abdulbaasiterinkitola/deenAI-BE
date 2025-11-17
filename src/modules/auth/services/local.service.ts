import { UsersService } from '@modules/users/users.service';
import { Injectable } from '@nestjs/common';
import { AuthProvider } from '@modules/users/enums';
import { UserType } from '@modules/users/types/user';
import RegisterDto from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { CustomHttpException } from '@shared/custom.exception';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LocalAuthService {
  constructor(private readonly usersService: UsersService) {}

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

  async login(dto: LoginDto) {
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

    return user;
  }
}
