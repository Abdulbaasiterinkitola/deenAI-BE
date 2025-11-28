import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenUsage } from './models/token-usage.entity';
import { TokenUsageActionModel } from './action-models/token-usage.action-model';
import { TokenUsageService } from './token-usage.service';

/**
 * Module for handling token usage tracking.
 * Exports TokenUsageService so it can be used by other modules (like ChatsModule) to track AI token consumption.
 */
@Module({
  imports: [TypeOrmModule.forFeature([TokenUsage])],
  providers: [TokenUsageActionModel, TokenUsageService],
  exports: [TokenUsageService],
})
export class TokenUsageModule {}
