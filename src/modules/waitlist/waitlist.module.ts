import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Waitlist } from './models/waitlist.model';
import { WaitlistController } from './waitlist.controller';
import { WaitlistService } from './waitlist.service';
import { WaitlistCoreService } from './services/waitlist-core.service';
import { WaitlistValidationService } from './services/waitlist-validation.service';
import { WaitlistActionModel } from './action-models/waitlist.action-model';


@Module({
imports: [TypeOrmModule.forFeature([Waitlist])],
controllers: [WaitlistController],
providers: [WaitlistService, WaitlistCoreService, WaitlistValidationService, WaitlistActionModel],
})
export class WaitlistModule {}
