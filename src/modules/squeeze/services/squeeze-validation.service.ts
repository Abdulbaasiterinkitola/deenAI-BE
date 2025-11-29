import { Injectable } from '@nestjs/common';
import { CustomHttpException } from '@shared/custom.exception';

@Injectable()
export class SqueezeValidationService {
  validateDuplicate(existing) {
    if (existing) {
      throw new CustomHttpException('Email already registered', 400);
    }
  }
}
