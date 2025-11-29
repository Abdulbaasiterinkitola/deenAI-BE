import { Injectable, HttpStatus } from '@nestjs/common';
import { CustomHttpException } from '@shared/custom.exception';
import { SqueezeActionModel } from '../action-models/squeeze.action-model';

@Injectable()
export class SqueezeValidationService {
  constructor(private readonly squeezeActionModel: SqueezeActionModel) {}

  async validateEmailDoesNotExist(email: string): Promise<void> {
    const existing = await this.squeezeActionModel.get({ email });

    if (existing) {
      throw new CustomHttpException(
        'Email already registered',
        HttpStatus.CONFLICT,
      );
    }
  }
}
