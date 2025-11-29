import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Squeeze } from './models/squeeze.model';
import { SqueezeController } from './squeeze.controller';
import { SqueezeService } from './squeeze.service';
import { SqueezeCoreService } from './services/squeeze-core.service';
import { SqueezeValidationService } from './services/squeeze-validation.service';
import { SqueezeActionModel } from './action-models/squeeze.action-model';

@Module({
  imports: [TypeOrmModule.forFeature([Squeeze])],
  controllers: [SqueezeController],
  providers: [
    SqueezeService,
    SqueezeCoreService,
    SqueezeValidationService,
    SqueezeActionModel,
  ],
})
export class SqueezeModule {}
