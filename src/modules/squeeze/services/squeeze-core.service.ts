import { Injectable } from '@nestjs/common';
import { SqueezeActionModel } from '../action-models/squeeze.action-model';
import { SqueezeDto } from '../dtos/squeeze.dto';
import { SqueezeValidationService } from './squeeze-validation.service';

@Injectable()
export class SqueezeCoreService {
  constructor(
    private readonly squeezeActionModel: SqueezeActionModel,
    private readonly validationService: SqueezeValidationService,
  ) {}

  async create(payload: SqueezeDto) {
    await this.validationService.validateEmailDoesNotExist(payload.email);

    return await this.squeezeActionModel.create({
      createPayload: {
        ...payload,
      },
    });
  }

  async findByEmail(email: string) {
    return await this.squeezeActionModel.get({ email });
  }
}
