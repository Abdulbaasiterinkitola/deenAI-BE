import { Module, forwardRef } from '@nestjs/common';
import { StreaksService } from './streaks.service';
import { StreaksController } from './streaks.controller';
import { StreaksCoreService } from './services/streaks-core.service';
import { StreaksCleanupService } from './services/streaks-cleanup.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Streak } from './models/streak.model';
import { AuthModule } from '@modules/auth/auth.module';
import { StreakActionModel } from './action-models/streak.model-action';
import { UsersModule } from '@modules/users/users.module';
import { TimezoneService } from '@shared/services/timezone.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Streak]),
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [StreaksController],
  providers: [
    StreaksService,
    StreaksCoreService,
    StreaksCleanupService,
    StreakActionModel,
    TimezoneService,
  ],
  exports: [StreaksService],
})
export class StreaksModule {}
