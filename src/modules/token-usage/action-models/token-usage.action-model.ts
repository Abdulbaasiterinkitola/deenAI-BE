import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractModelAction } from '@shared/abstract-model-action';
import { TokenUsage } from '../models/token-usage.entity';

/**
 * Action Model for TokenUsage.
 * Extends the AbstractModelAction to provide standard CRUD operations for the TokenUsage entity.
 * This abstraction layer separates the database repository logic from the business service layer.
 */
@Injectable()
export class TokenUsageActionModel extends AbstractModelAction<TokenUsage> {
  constructor(
    @InjectRepository(TokenUsage)
    private readonly tokenUsageRepository: Repository<TokenUsage>,
  ) {
    super(tokenUsageRepository, TokenUsage);
  }
  // Sums total tokens used by a specific user
  async sumTotalTokens(userId: string): Promise<number> {
    const result = await this.tokenUsageRepository
      .createQueryBuilder('token_usage')
      .select('SUM(token_usage.totalTokens)', 'total')
      .where('token_usage.userId = :userId', { userId })
      .getRawOne();

    return parseInt((result?.total as string) || '0', 10);
  }

  /**
   * Sums total tokens used by a specific user since a given date.
   * This is used for calculating monthly usage based on the billing cycle.
   * @param userId - The ID of the user
   * @param since - The date to start calculating from (e.g., billing cycle start)
   */
  async sumTokensSince(userId: string, since: Date): Promise<number> {
    const result = await this.tokenUsageRepository
      .createQueryBuilder('token_usage')
      .select('SUM(token_usage.totalTokens)', 'total')
      .where('token_usage.userId = :userId', { userId })
      .andWhere('token_usage.createdAt >= :since', { since })
      .getRawOne();

    return parseInt((result?.total as string) || '0', 10);
  }
}
