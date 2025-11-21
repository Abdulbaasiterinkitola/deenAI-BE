import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountDeletionCode } from '../models/account-deletion.model';
import { EntityManager, Repository } from 'typeorm';
import { normalizeEmail } from '@shared/helpers/email.helper';
import { CustomHttpException } from '@shared/custom.exception';

@Injectable()
export class DeletionCodeService {
  logger = new Logger(DeletionCodeService.name);
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

    this.logger.log(
      `Generating account deletion code for user ID: ${userId}, email: ${normalizedEmail}`,
    );

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    // Delete any existing codes for this user and email
    await this.deletionCodeRepo.delete({
      userId: userId,
      email: normalizedEmail,
    });

    const record = this.deletionCodeRepo.create({
      userId,
      email: normalizedEmail,
      code,
      expiresAt,
      isUsed: false,
    });

    await this.deletionCodeRepo.save(record);

    this.logger.log(
      `Account deletion code generated for user ID: ${userId}, email: ${normalizedEmail}`,
    );

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

    this.logger.log(
      `Confirming account deletion code for user ID: ${userId}, email: ${normalizedEmail}`,
    );

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
      this.logger.warn(
        `Account deletion code expired for user ID: ${userId}, email: ${normalizedEmail}`,
      );
      return false;
    }

    await this.deletionCodeRepo.delete({
      id: record.id,
    });

    this.logger.log(
      `Account deletion code confirmed for user ID: ${userId}, email: ${normalizedEmail}`,
    );

    return true;
  }

  async confirmAccountDeletionCodeWithTransaction(
    userId: string,
    code: string,
    email: string,
    transactionalEntityManager: EntityManager,
  ) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      throw new CustomHttpException(
        'Email is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    this.logger.log(
      `Confirming account deletion code for user ID: ${userId}, email: ${normalizedEmail} (transactional)`,
    );

    const record = await transactionalEntityManager.findOne(
      AccountDeletionCode,
      {
        where: {
          userId: userId,
          email: normalizedEmail,
          code: code,
          isUsed: false,
        },
      },
    );

    if (!record) {
      this.logger.warn(
        `Account deletion code not found for user ID: ${userId}, email: ${normalizedEmail}`,
      );
      return false;
    }

    if (record.expiresAt < new Date()) {
      this.logger.warn(
        `Account deletion code expired for user ID: ${userId}, email: ${normalizedEmail}`,
      );
      return false;
    }

    // Delete the record within the transaction
    await transactionalEntityManager.delete(AccountDeletionCode, {
      id: record.id,
    });

    this.logger.log(
      `Account deletion code confirmed for user ID: ${userId}, email: ${normalizedEmail} (transactional)`,
    );

    return true;
  }
}
