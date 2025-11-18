import { UsersService } from '@modules/users/users.service';
import { Injectable } from '@nestjs/common';
import { AuthProvider } from '@modules/users/enums';
import { UserType } from '@modules/users/types/user';
import RegisterDto from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { CustomHttpException } from '@shared/custom.exception';
import { AuthValidationService } from './auth-validation.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LocalAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authValidationService: AuthValidationService,
  ) {}

  async register(dto: RegisterDto) {
    // Validate email using validation service
    this.authValidationService.validateUserEmail(dto.email);
    
    // Check if user already exists
    const existingUser = await this.usersService.getUserByEmail(dto.email);
    
    // Validate user creation using validation service
    this.authValidationService.validateUserCreation(dto.email, AuthProvider.LOCAL, existingUser);
    
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
    // Validate email using validation service
    this.authValidationService.validateUserEmail(dto.email);
    
    const user = await this.usersService.getUserByEmail(dto.email);

    if (!user) {
      throw new CustomHttpException('Invalid login credentials', 401);
    }

    // Check for auth provider conflicts using validation service
    this.authValidationService.validateAuthProviderConflict(user, AuthProvider.LOCAL);

    const isPasswordMatch = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordMatch) {
      throw new CustomHttpException('Invalid login credentials', 401);
    }

    return user;
  }
}
