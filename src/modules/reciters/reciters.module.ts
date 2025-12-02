import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reciter } from './models/reciter.model';
import { ReciterModelAction } from './reciter.model-action';
import { RecitersCoreService } from './services/reciters-core.service';
import { RecitersQueryService } from './services/reciters-query.service';
import { RecitersService } from './reciters.service';
import { RecitersController } from './reciters.controller';
import { ConfigModule } from '@nestjs/config';
import { AdminGuard } from './guards/admin.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Reciter]), ConfigModule],
  controllers: [RecitersController],
  providers: [ReciterModelAction, RecitersCoreService, RecitersQueryService, RecitersService, AdminGuard],
  exports: [RecitersService, ReciterModelAction, RecitersQueryService, RecitersCoreService, AdminGuard],
})
export class RecitersModule {}
