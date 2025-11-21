// src/modules/auth/services/reset-password.service.ts
import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { UsersService } from '@modules/users/users.service';
import * as bcrypt from 'bcrypt';
import { EmailService } from '@modules/email/email.service';
import { normalizeEmail } from '@helpers/email.helper';
import { CustomHttpException } from '@shared/custom.exception';
import { OtpActionModel } from '../action-models/otp.action-model';

@Injectable()
export class ResetPasswordService {
  private readonly logger = new Logger(ResetPasswordService.name);
  emailQueue: any;

  constructor(
    private readonly otpActionModel: OtpActionModel,
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
  ) {}

  // Generate OTP and send email
  async requestOtp(email: string) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      throw new CustomHttpException(
        'Email is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.usersService.getUserByEmail(normalizedEmail);
    if (!user) {
      this.logger.warn(
        `OTP requested for non-existing email: ${normalizedEmail}`,
      );
      throw new CustomHttpException('Email not found', HttpStatus.NOT_FOUND);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.otpActionModel.create({
      createPayload: {
        email: normalizedEmail,
        otp,
        expiresAt,
        isVerified: false,
        usedAt: null,
      },
    });

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

    return { message: 'OTP sent' };
  }

  // Verify OTP
  // inside ResetPasswordService

  async verifyOtp(email: string, otp: string) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      throw new CustomHttpException(
        'Email is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    this.logger.log(`Verifying OTP for email: ${email}, otp: ${otp}`);

    const record = await this.otpActionModel.get({
      email: normalizedEmail,
      otp,
    });

    this.logger.log(`Record found: ${JSON.stringify(record)}`);

    if (!record) {
      throw new CustomHttpException('Invalid OTP', HttpStatus.BAD_REQUEST);
    }
    if (record.isVerified) {
      throw new CustomHttpException(
        'OTP has already been verified',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (record.usedAt) {
      throw new CustomHttpException(
        'OTP has already been used',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (record.expiresAt < new Date()) {
      throw new CustomHttpException('OTP has expired', HttpStatus.BAD_REQUEST);
    }

    // Use model-action update so metadata remains consistent
    await this.otpActionModel.update({
      updatePayload: { isVerified: true },
      identifierOptions: { id: record.id },
    });

    this.logger.log(
      `Updated isVerified using model-action for id: ${record.id}`,
    );

    return { message: 'OTP verified successfully' };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      throw new CustomHttpException(
        'Email is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    this.logger.log(`Reset password attempt for email: ${email}`);

    const record = await this.otpActionModel.get({
      email: normalizedEmail,
      otp,
    });

    this.logger.log(`Found record: ${JSON.stringify(record)}`);

    if (!record) {
      throw new CustomHttpException('Invalid OTP', HttpStatus.BAD_REQUEST);
    }
    if (!record.isVerified) {
      this.logger.error(`OTP not verified. isVerified = ${record.isVerified}`);
      throw new CustomHttpException('OTP not verified', HttpStatus.BAD_REQUEST);
    }
    if (record.usedAt) {
      throw new CustomHttpException(
        'OTP has already been used',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (record.expiresAt < new Date()) {
      throw new CustomHttpException('OTP has expired', HttpStatus.BAD_REQUEST);
    }

    const user = await this.usersService.getUserByEmail(normalizedEmail);
    if (!user) {
      throw new CustomHttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.updateUserPassword(user.id, hashedPassword);

    // Mark OTP as used
    await this.otpActionModel.update({
      updatePayload: { usedAt: new Date() },
      identifierOptions: { id: record.id },
    });

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

    return { message: 'Password has been successfully reset' };
  }
}
