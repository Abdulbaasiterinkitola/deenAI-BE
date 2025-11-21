import { Injectable } from '@nestjs/common';
import { AbstractModelAction } from '@shared/abstract-model-action';
import { PasswordResetOtp } from '../models/otp.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class OtpActionModel extends AbstractModelAction<PasswordResetOtp> {
  constructor(
    @InjectRepository(PasswordResetOtp)
    repository: Repository<PasswordResetOtp>,
  ) {
    super(repository, PasswordResetOtp);
  }
}
