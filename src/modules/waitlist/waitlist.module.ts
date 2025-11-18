import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Waitlist } from './models/waitlist.model';
import { WaitlistController } from './waitlist.controller';
import { WaitlistService } from './waitlist.service';
import { WaitlistCoreService } from './services/waitlist-core.service';
import { WaitlistValidationService } from './services/waitlist-validation.service';
import { WaitlistActionModel } from './action-models/waitlist.action-model';
import { EmailServiceModule } from '@modules/email/email.module';


@Module({
<<<<<<< HEAD
  imports: [TypeOrmModule.forFeature([Waitlist]), EmailServiceModule],
  controllers: [WaitlistController],
  providers: [
    WaitlistService,
    WaitlistCoreService,
    WaitlistValidationService,
    WaitlistActionModel,
  ],
=======
imports: [TypeOrmModule.forFeature([Waitlist])],
controllers: [WaitlistController],
providers: [WaitlistService, WaitlistCoreService, WaitlistValidationService, WaitlistActionModel],
>>>>>>> 7b5622d97bcab8e39188d86b8dfa5e08e04dbdf4
})
export class WaitlistModule {}
