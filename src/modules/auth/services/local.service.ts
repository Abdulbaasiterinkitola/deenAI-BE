import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { UsersService } from '@modules/users/users.service';
import { EmailService } from '@modules/email/email.service';
import { AuthProvider } from '@modules/users/enums';
import * as bcrypt from 'bcrypt';
import { UserStatus } from '@modules/users/enums/user-status.enum';
import { LoginDto } from '../dtos/login.dto';
import RegisterDto from '../dtos/register.dto';
import { OtpService } from './otp.service';
import UserValidationService from '@modules/users/services/user-validation.service';
import { AuthValidationService } from './auth-validation.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { normalizeEmail } from '@helpers/email.helper';
import { CustomHttpException } from '@shared/custom.exception';
import { ProfileService } from '@modules/profile/profile.service';

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
    private readonly profileService: ProfileService,
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

    // Validate user creation
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
      status: UserStatus.ACTIVE,
    };

    // Create user
    await this.usersService.createUser(userData);

    // Retrieve the newly created user
    const createdUser = await this.usersService.getUserByEmail(email);
    if (!createdUser) {
      throw new CustomHttpException(
        'Failed to retrieve created user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Send welcome email for new users
    await this.sendWelcomeEmail(createdUser);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = createdUser;

    return {
      user: userWithoutPassword,
    };
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
    if (!user) return { message: 'If an account exists, OTP sent' };

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

    return { message: 'If an account exists, OTP sent' };
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

    return { message: 'OTP is valid' };
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

    return { message: 'Password has been successfully reset' };
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
    const profile = await this.profileService.getProfile(user.id);
    return {
      user: userWithoutPassword,
      profile,
    };
  }

  private async sendWelcomeEmail(user: any): Promise<void> {
    try {
      await this.emailService.sendEmail(
        user.email as string,
        'Welcome to Deen AI',
        'welcome',
        { name: user.name },
      );
      this.logger.log(
        `Welcome email sent to new local auth user: ${user.email}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to ${user.email}: ${(error as Error).message}`,
      );
      // Don't throw error - user creation should not fail due to email issues
    }
  }
}
