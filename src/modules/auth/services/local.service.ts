import { UsersService } from '@modules/users/users.service';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AuthProvider } from '@modules/users/enums';
import { UserType } from '@modules/users/types/user';
import RegisterDto from '../dtos/register.dto';
import { getFrontendUrlFromRefererOrEnv } from '@shared/url.utils';
import { LoginDto } from '../dtos/login.dto';
import * as bcrypt from 'bcrypt';
import { EmailService } from '@modules/email/email.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';
import { UserResponseDto } from '../../users/dtos/user-response.dto';
import UserValidationService from '../../users/services/user-validation.service';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';

@Injectable()
export class LocalAuthService {
  private readonly logger = new Logger(LocalAuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userValidationService: UserValidationService,
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

  async forgotPassword(
    dto: ForgotPasswordDto,
    token: string,
    referer?: string,
  ): Promise<{ success: boolean; message: string }> {
    const { email } = dto;
    const user = await this.usersService.getUserByEmail(email);

    if (!user) {
      return {
        success: true,
        message:
          'If an account with that email exists, a password reset link has been sent.',
      };
    }

    const provider = (user.authProvider || '').toString().toLowerCase();
    if (provider !== 'local') {
      throw new BadRequestException(
        'Password reset is only available for accounts with email/password authentication. Please use your Google/Apple account to sign in.',
      );
    }

    const frontend = getFrontendUrlFromRefererOrEnv(referer) || null;
    if (!frontend) {
      this.logger.error('FRONTEND_URL not configured and no referer provided.');
    }

    const resetLink = frontend
      ? `${frontend}/reset-password?token=${encodeURIComponent(token)}`
      : `?token=${encodeURIComponent(token)}`;

    try {
      await this.emailService.sendEmail(
        email,
        'DeenAI - Password Reset Request',
        'forgot-password',
        { name: user.name || 'User', resetLink },
      );
    } catch (err) {
      this.logger.error('Failed to send password reset email', err);
    }

    return {
      success: true,
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { token, newPassword } = dto;

    let payload: { sub: string; email: string };

    try {
      payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('auth.jwtSecret'),
      });
    } catch {
      throw new BadRequestException('Invalid or expired reset token.');
    }

    const user = await this.usersService.getUserById(payload.sub);

    if (!user) {
      throw new BadRequestException('Invalid token or user no longer exists.');
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await this.usersService.updateUserPassword(user.id, hashed);

    return {
      success: true,
      message: 'Password has been successfully reset.',
    };
  }

  async login(dto: LoginDto): Promise<{
    success: boolean;
    message: string;
    data: { token: string; user: UserResponseDto };
  }> {
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
