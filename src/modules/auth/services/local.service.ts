import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { UsersService } from '@modules/users/users.service';
import { EmailService } from '@modules/email/email.service';
import { AuthProvider } from '@modules/users/enums';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dtos/login.dto';
import RegisterDto from '../dtos/register.dto';
import { OtpService } from './otp.service';
import UserValidationService from '@modules/users/services/user-validation.service';
import { AuthValidationService } from './auth-validation.service';

@Injectable()
export class LocalAuthService {
  private readonly logger = new Logger(LocalAuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
    private readonly userValidationService: UserValidationService,
    private readonly authValidationService: AuthValidationService,
    private readonly otpService: OtpService,
  ) {}

  async register(dto: RegisterDto) {
    // Validate email using validation service

    // Check if user already exists
    const existingUser = await this.usersService.getUserByEmail(dto.email);

    // Validate user creation using validation service
    this.authValidationService.validateUserCreation(
      dto.email,
      AuthProvider.LOCAL,
      existingUser,
    );

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const userData = {
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      authProvider: AuthProvider.LOCAL,
      isEmailVerified: false,
    };
    await this.usersService.createUser(userData);
    await this.emailService.sendEmail(
      dto.email,
      'Welcome to DeenAI',
      'welcome',
      { name: dto.name || 'User' },
    );
    return { success: true, message: 'User registered successfully' };
  }

  async requestPasswordReset(dto: { email: string }) {
    const { email } = dto;
    const user = await this.usersService.getUserByEmail(email);
    if (!user)
      return { success: true, message: 'If an account exists, OTP sent' };

    if ((user.authProvider || '').toLowerCase() !== 'local') {
      throw new BadRequestException(
        'Password reset only for email/password accounts',
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
    const { email, otp } = dto;
    const valid = await this.otpService.validateOtp(email, otp);
    if (!valid) throw new BadRequestException('Invalid or expired OTP');

    return { success: true, message: 'OTP is valid' };
  }

  async resetPasswordWithOtp(dto: {
    email: string;
    otp: string;
    newPassword: string;
  }) {
    const { email, otp, newPassword } = dto;

    const valid = await this.otpService.validateOtp(email, otp);
    if (!valid) throw new BadRequestException('Invalid or expired OTP');

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.usersService.updateUserPassword(email, hashed);

    return { success: true, message: 'Password has been successfully reset' };
  }

  async login(dto: LoginDto) {
    const user = await this.userValidationService.validateUserForLogin(
      dto.email,
      dto.password,
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return {
      success: true,
      message: 'Login successful',
      data: { user: userWithoutPassword },
    };
  }
}
