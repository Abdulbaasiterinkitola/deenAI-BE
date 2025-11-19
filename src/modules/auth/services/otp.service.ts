import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { PasswordResetOtp } from '../models/otp.model';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(PasswordResetOtp)
    private otpRepo: Repository<PasswordResetOtp>,
  ) {}

  async generateOtp(email: string, ttlMinutes = 10): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    const record = this.otpRepo.create({
      id: uuidv4(), // generate UUID for the PK
      email,
      otp,
      expiresAt,
    });

    await this.otpRepo.save(record);

    return otp;
  }

  async validateOtp(email: string, otp: string): Promise<boolean> {
    const record = await this.otpRepo.findOne({ where: { email, otp } });
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
