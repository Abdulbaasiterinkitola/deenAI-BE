import { UsersService } from '@modules/users/users.service';
import { Injectable } from '@nestjs/common';
import { AuthProvider } from '@modules/users/enums';
import { UserType } from '@modules/users/types/user';
import RegisterDto from '../dtos/register.dto';

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
}
