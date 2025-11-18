import { UsersService } from '@modules/users/users.service';
import { Injectable } from '@nestjs/common';
import { AuthProvider } from '@modules/users/enums';
import { UserType } from '@modules/users/types/user';
import RegisterDto from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';

import { AuthValidationService } from './auth-validation.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';
import { UserResponseDto } from '../../users/dtos/user-response.dto';
import UserValidationService from '../../users/services/user-validation.service';

@Injectable()
export class LocalAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userValidationService: UserValidationService,
    private readonly authValidationService: AuthValidationService,
  ) {}

  async register(dto: RegisterDto) {
    // Validate email using validation service
    this.authValidationService.validateUserEmail(dto.email);
    
    // Check if user already exists
    const existingUser = await this.usersService.getUserByEmail(dto.email);
    
    // Validate user creation using validation service
    this.authValidationService.validateUserCreation(dto.email, AuthProvider.LOCAL, existingUser);
    
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

  async login(dto: LoginDto): Promise<{
    success: boolean;
    message: string;
    data: { token: string; user: UserResponseDto };
  }> {
    // Validate email using validation service
    this.authValidationService.validateUserEmail(dto.email);
    
    const user = await this.userValidationService.validateUserForLogin(
      dto.email,
      dto.password,
    );

    const token = this.jwtService.sign(
      { sub: user.id, email: user.email },
      {
        secret: this.configService.get<string>('auth.jwtSecret'),
        expiresIn: this.configService.get<StringValue>('auth.jwtExpiry'),
      },
    );

    // Check for auth provider conflicts using validation service
    this.authValidationService.validateAuthProviderConflict(user, AuthProvider.LOCAL);
    
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
