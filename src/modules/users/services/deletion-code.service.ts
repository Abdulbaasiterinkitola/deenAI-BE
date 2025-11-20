import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountDeletionCode } from '../models/account-deletion.model';
import { Repository } from 'typeorm';
import { normalizeEmail } from '@shared/helpers/email.helper';
import { CustomHttpException } from '@shared/custom.exception';

@Injectable()
export class DeletionCodeService {
  constructor(
    @InjectRepository(AccountDeletionCode)
    private deletionCodeRepo: Repository<AccountDeletionCode>,
  ) {}

  async generateAccountDeletionCode(
    userId: string,
    email: string,
    ttlMinutes = 10,
  ) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      throw new CustomHttpException(
        'Email is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const code = Math.floor(100000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    const record = this.deletionCodeRepo.create({
      userId,
      email: normalizedEmail,
      code,
      expiresAt,
      isUsed: false,
    });

    await this.deletionCodeRepo.save(record);

    return code;
  }

  async confirmAccountDeletionCode(
    userId: string,
    code: string,
    email: string,
  ) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      throw new CustomHttpException(
        'Email is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const record = await this.deletionCodeRepo.findOne({
      where: {
        userId: userId,
        email: normalizedEmail,
        code: code,
        isUsed: false,
      },
    });

    if (!record) return false;

    if (record.expiresAt < new Date()) {
      return false;
    }

    record.isUsed = true;
    await this.deletionCodeRepo.delete({
      id: record.id,
    });

    return true;
  }
}
