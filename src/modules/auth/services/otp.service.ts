import { Injectable, HttpStatus } from '@nestjs/common';
import { normalizeEmail } from '@helpers/email.helper';
import { CustomHttpException } from '@shared/custom.exception';
import { OtpActionModel } from '../action-models/otp.action-model';

@Injectable()
export class OtpService {
  constructor(private readonly otpActionModel: OtpActionModel) {}

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

    await this.otpActionModel.create({
      createPayload: {
        email: normalizedEmail,
        otp,
        expiresAt,
        isVerified: false,
        usedAt: null,
      },
    });

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

    const record = await this.otpActionModel.get({
      email: normalizedEmail,
      otp,
    });
    if (!record) return false;

    // Check if expired
    if (record.expiresAt < new Date()) {
      await this.otpActionModel.delete({
        identifierOptions: {
          id: record.id,
        },
      });
      return false;
    }

    // OTP can only be used once
    await this.otpActionModel.delete({
      identifierOptions: {
        id: record.id,
      },
    });
    return true;
  }
}
