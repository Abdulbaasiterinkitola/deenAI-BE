import { HttpStatus, Injectable } from '@nestjs/common';
import { CustomHttpException } from '@shared/custom.exception';

@Injectable()
export class PlansValidationService {
  validatePagination(page?: number, limit?: number): void {
    if (page !== undefined && (page < 1 || !Number.isInteger(page))) {
      throw new CustomHttpException(
        'page must be a positive integer',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (limit !== undefined) {
      if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        throw new CustomHttpException(
          'limit must be between 1 and 100',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  validateId(id: string): void {
    if (!id) {
      throw new CustomHttpException(
        'Plan id is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new CustomHttpException(
        'Invalid plan id format',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
