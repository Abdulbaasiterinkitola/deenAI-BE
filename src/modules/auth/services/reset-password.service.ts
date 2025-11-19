// src/modules/auth/services/reset-password.service.ts
import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '@modules/users/users.service';
import * as bcrypt from 'bcrypt';
import { EmailService } from '@modules/email/email.service';
import { PasswordResetOtp } from '../models/otp.model';

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
      throw new NotFoundException('Email not found');
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

    const fallbackName = user.name ?? user.email.split('@')[0];

    try {
      await this.emailService.sendEmail(
        user.email,
        'Your OTP for Password Reset',
        'forgot-password',
        {
          name: fallbackName,
          otp,
        },
      );
      this.logger.log(`OTP email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send OTP email to ${user.email}: ${(error as Error).message}`,
      );
    }

    return { success: true, message: 'OTP sent' };
  }

  // Verify OTP
  // inside ResetPasswordService

  async verifyOtp(email: string, otp: string) {
    this.logger.log(`Verifying OTP for email: ${email}, otp: ${otp}`);

    // explicitly select the boolean and used_at columns
    const record = await this.otpRepo
      .createQueryBuilder('otp')
      .where('otp.email = :email', { email })
      .andWhere('otp.otp = :otp', { otp })
      .addSelect(['otp.is_verified', 'otp.used_at'])
      .getOne();

    this.logger.log(`Record found: ${JSON.stringify(record)}`);

    if (!record) throw new BadRequestException('Invalid OTP');
    if (record.isVerified)
      throw new BadRequestException('OTP has already been verified');
    if (record.usedAt)
      throw new BadRequestException('OTP has already been used');
    if (record.expiresAt < new Date())
      throw new BadRequestException('OTP has expired');

    // Use TypeORM update so metadata remains consistent
    await this.otpRepo.update({ id: record.id }, { isVerified: true });

    this.logger.log(
      `Updated isVerified using repository.update for id: ${record.id}`,
    );

    // Re-fetch and include the same explicit selects
    const check = await this.otpRepo
      .createQueryBuilder('otp')
      .where('otp.id = :id', { id: record.id })
      .addSelect(['otp.is_verified', 'otp.used_at'])
      .getOne();

    this.logger.log(`After update check: ${JSON.stringify(check)}`);

    return { success: true, message: 'OTP verified successfully' };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    this.logger.log(`Reset password attempt for email: ${email}`);

    // explicitly select is_verified and used_at
    const record = await this.otpRepo
      .createQueryBuilder('otp')
      .where('otp.email = :email', { email })
      .andWhere('otp.otp = :otp', { otp })
      .addSelect(['otp.is_verified', 'otp.used_at'])
      .getOne();

    this.logger.log(`Found record: ${JSON.stringify(record)}`);

    if (!record) throw new BadRequestException('Invalid OTP');
    if (!record.isVerified) {
      this.logger.error(`OTP not verified. isVerified = ${record.isVerified}`);
      throw new BadRequestException('OTP not verified');
    }
    if (record.usedAt)
      throw new BadRequestException('OTP has already been used');
    if (record.expiresAt < new Date())
      throw new BadRequestException('OTP has expired');

    const user = await this.usersService.getUserByEmail(email);
    if (!user) throw new BadRequestException('User not found');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.updateUserPassword(user.id, hashedPassword);

    // Use repository.update for usedAt
    await this.otpRepo.update({ id: record.id }, {
      usedAt: () => 'NOW()',
    } as any);

    // Send password reset success email
    const fallbackName = user.name ?? user.email.split('@')[0];
    try {
      await this.emailService.sendEmail(
        user.email,
        'Password Reset Successful - Deen AI',
        'password-reset-success',
        {
          name: fallbackName,
        },
      );
      this.logger.log(`Password reset success email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset success email to ${user.email}: ${(error as Error).message}`,
      );
    }

    return { success: true, message: 'Password has been successfully reset' };
  }
}
