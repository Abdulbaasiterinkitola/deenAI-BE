// src/modules/auth/services/reset-password.service.ts
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '@modules/users/users.service';
import * as bcrypt from 'bcrypt';
import { EmailService } from '@modules/email/email.service';
import { PasswordResetOtp } from '../entities/password-reset-otp.entity';

@Injectable()
export class ResetPasswordService {
  private readonly logger = new Logger(ResetPasswordService.name);
  emailQueue: any;

  constructor(
    @InjectRepository(PasswordResetOtp)
    private readonly otpRepo: Repository<PasswordResetOtp>,
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
  ) {}

  // Generate OTP and send email
  async requestOtp(email: string) {
    const user = await this.usersService.getUserByEmail(email);
    if (!user) {
      this.logger.warn(`OTP requested for non-existing email: ${email}`);
      return { success: true, message: 'If an account exists, OTP sent' };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const otpRecord = this.otpRepo.create({
      email,
      otp,
      expiresAt,
      isVerified: false,
      usedAt: null,
    });

    await this.otpRepo.save(otpRecord);

    // Directly send email
    const fallbackName = user.name ?? user.email.split('@')[0];
    try {
      await this.emailService.sendEmail(
        user.email,
        fallbackName,
        'Your OTP for Password Reset',
        'otp-email', // template name
        { otp }, // variables for template
      );
      this.logger.log(`OTP email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send OTP email to ${user.email}: ${(error as Error).message}`,
      );
    }

    return { success: true, message: 'If an account exists, OTP sent' };
  }

  // Verify OTP
  async verifyOtp(email: string, otp: string) {
    const record = await this.otpRepo.findOne({ where: { email, otp } });

    if (!record) throw new BadRequestException('Invalid OTP');
    if (record.isVerified)
      throw new BadRequestException('OTP has already been verified');
    if (record.usedAt)
      throw new BadRequestException('OTP has already been used');
    if (record.expiresAt < new Date())
      throw new BadRequestException('OTP has expired');

    record.isVerified = true;
    await this.otpRepo.save(record);

    return { success: true, message: 'OTP verified successfully' };
  }

  // Reset password using OTP
  async resetPassword(email: string, otp: string, newPassword: string) {
    const record = await this.otpRepo.findOne({ where: { email, otp } });

    if (!record) throw new BadRequestException('Invalid OTP');
    if (!record.isVerified) throw new BadRequestException('OTP not verified');
    if (record.usedAt)
      throw new BadRequestException('OTP has already been used');
    if (record.expiresAt < new Date())
      throw new BadRequestException('OTP has expired');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.updateUserPassword(email, hashedPassword);

    record.usedAt = new Date();
    await this.otpRepo.save(record);

    return { success: true, message: 'Password has been successfully reset' };
  }
}
