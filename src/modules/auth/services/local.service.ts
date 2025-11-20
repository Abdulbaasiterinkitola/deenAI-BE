import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { UsersService } from '@modules/users/users.service';
import { EmailService } from '@modules/email/email.service';
import { AuthProvider } from '@modules/users/enums';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dtos/login.dto';
import RegisterDto from '../dtos/register.dto';
import { OtpService } from './otp.service';
import UserValidationService from '@modules/users/services/user-validation.service';
import { AuthValidationService } from './auth-validation.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { normalizeEmail } from '@helpers/email.helper';
import { CustomHttpException } from '@shared/custom.exception';

@Injectable()
export class LocalAuthService {
  private readonly logger = new Logger(LocalAuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
    private readonly userValidationService: UserValidationService,
    private readonly authValidationService: AuthValidationService,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const email = normalizeEmail(dto.email);
    if (!email) {
      throw new CustomHttpException(
        'Email is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingUser = await this.usersService.getUserByEmail(email);

    // Validate user creation using validation service
    this.authValidationService.validateUserCreation(
      email,
      AuthProvider.LOCAL,
      existingUser,
    );

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const userData = {
      name: dto.name,
      email,
      password: hashedPassword,
      authProvider: AuthProvider.LOCAL,
      isEmailVerified: false,
    };
    await this.usersService.createUser(userData);
    await this.emailService.sendEmail(email, 'Welcome to DeenAI', 'welcome', {
      name: dto.name || 'User',
    });
    return { success: true, message: 'User registered successfully' };
  }

  async requestPasswordReset(dto: { email: string }) {
    const email = normalizeEmail(dto.email);
    if (!email) {
      throw new CustomHttpException(
        'Email is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this.usersService.getUserByEmail(email);
    if (!user)
      return { success: true, message: 'If an account exists, OTP sent' };

    if ((user.authProvider || '').toLowerCase() !== 'local') {
      throw new CustomHttpException(
        'Password reset only for email/password accounts',
        HttpStatus.BAD_REQUEST,
      );
    }

    const otp = await this.otpService.generateOtp(email, 10); // 10 min expiry

    await this.emailService.sendEmail(
      email,
      'Your OTP for Password Reset',
      'forgot-password',
      { name: user.name || 'User', otp },
    );

    return { success: true, message: 'If an account exists, OTP sent' };
  }

  async verifyOtp(dto: { email: string; otp: string }) {
    const email = normalizeEmail(dto.email);
    if (!email) {
      throw new CustomHttpException(
        'Email is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const { otp } = dto;
    const valid = await this.otpService.validateOtp(email, otp);
    if (!valid) {
      throw new CustomHttpException(
        'Invalid or expired OTP',
        HttpStatus.BAD_REQUEST,
      );
    }

    return { success: true, message: 'OTP is valid' };
  }

  async resetPasswordWithOtp(dto: {
    email: string;
    otp: string;
    newPassword: string;
  }) {
    const email = normalizeEmail(dto.email);
    if (!email) {
      throw new CustomHttpException(
        'Email is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const { otp, newPassword } = dto;

    const valid = await this.otpService.validateOtp(email, otp);
    if (!valid) {
      throw new CustomHttpException(
        'Invalid or expired OTP',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.usersService.updateUserPassword(email, hashed);

    return { success: true, message: 'Password has been successfully reset' };
  }

  async login(dto: LoginDto) {
    const email = normalizeEmail(dto.email);
    if (!email) {
      throw new CustomHttpException(
        'Email is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this.userValidationService.validateUserForLogin(
      email,
      dto.password,
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return {
      success: true,
      message: 'User validated successfully',
      data: {
        user: userWithoutPassword,
      },
    };
  }
}
