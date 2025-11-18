import { UsersService } from '@modules/users/users.service';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AuthProvider } from '@modules/users/enums';
import { UserType } from '@modules/users/types/user';
import RegisterDto from '../dtos/register.dto';
import { ForgotPasswordDto } from '../dtos/forgotPassword.dto';
import { getFrontendUrlFromRefererOrEnv } from '@shared/url.utils';
import { LoginDto } from '../dtos/login.dto';
import * as bcrypt from 'bcrypt';
import { EmailService } from '@modules/email/email.service';

@Injectable()
export class LocalAuthService {
  private readonly logger = new Logger(LocalAuthService.name);
  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
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
    // 1) Attempt to find user
    const user = await this.usersService.getUserByEmail(email);

    // If user not found --> do NOT reveal. Return generic success (prevents enumeration).
    if (!user) {
      return {
        success: true,
        message:
          'If an account with that email exists, a password reset link has been sent.',
      };
    }

    // If user exists but uses OAuth, return 400 with helpful message
    const provider = (user.authProvider || '').toString().toLowerCase();
    if (provider !== 'local') {
      throw new BadRequestException(
        'Password reset is only available for accounts with email/password authentication. Please use your Google/Apple account to sign in.',
      );
    }

    // 2) Build frontend URL (prefer referer header, fallback env FRONTEND_URL)
    const frontend = getFrontendUrlFromRefererOrEnv(referer) || null;
    if (!frontend) {
      // We log an error so ops can fix missing FRONTEND_URL, but still return success to avoid leaking info.
      this.logger.error('FRONTEND_URL not configured and no referer provided.');
    }

    const resetLink = frontend
      ? `${frontend}/reset-password?token=${encodeURIComponent(token)}`
      : `?token=${encodeURIComponent(token)}`;

    // 3) Send email (if emailService is configured). Don't propagate provider errors to client.
    try {
      await this.emailService.sendEmail(
        email,
        'DeenAI - Password Reset Request',
        'forgot-password', // Template name
        { name: user.name || 'User', resetLink }, // Context for the template
      );
    } catch (err) {
      this.logger.error('Failed to send password reset email', err);
    }

    // 4) Return success message (do not reveal whether token/email was valid)
    return {
      success: true,
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.getUserByEmail(dto.email);
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
