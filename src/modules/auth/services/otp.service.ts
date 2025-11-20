import { Injectable, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { PasswordResetOtp } from '../models/otp.model';
import { normalizeEmail } from '@helpers/email.helper';
import { CustomHttpException } from '@shared/custom.exception';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(PasswordResetOtp)
    private otpRepo: Repository<PasswordResetOtp>,
  ) {}

  async generateOtp(email: string, ttlMinutes = 10): Promise<string> {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      throw new CustomHttpException(
        'Email is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    const record = this.otpRepo.create({
      id: uuidv4(), // generate UUID for the PK
      email: normalizedEmail,
      otp,
      expiresAt,
    });

    await this.otpRepo.save(record);

    return otp;
  }

  async validateOtp(email: string, otp: string): Promise<boolean> {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      throw new CustomHttpException(
        'Email is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const record = await this.otpRepo.findOne({
      where: { email: normalizedEmail, otp },
    });
    if (!record) return false;

    // Check if expired
    if (record.expiresAt < new Date()) {
      await this.otpRepo.delete({ id: record.id });
      return false;
    }

    // OTP can only be used once
    await this.otpRepo.delete({ id: record.id });
    return true;
  }
}
