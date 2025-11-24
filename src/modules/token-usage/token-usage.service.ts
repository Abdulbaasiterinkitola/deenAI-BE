import { Injectable } from '@nestjs/common';
import { TokenUsageActionModel } from './action-models/token-usage.action-model';

/**
 * Service responsible for managing token usage tracking.
 * It provides methods to record new usage and retrieve usage history for users.
 */
@Injectable()
export class TokenUsageService {
  constructor(private readonly tokenUsageActionModel: TokenUsageActionModel) {}

  /**
   * Records a new token usage entry in the database.
   *
   * @param userId - The ID of the user who consumed the tokens.
   * @param usage - An object containing the token counts (input, output, total).
   * @returns The created TokenUsage entity.
   */
  async trackUsage(
    userId: string,
    usage: { inputTokens: number; outputTokens: number; totalTokens: number },
  ) {
    return this.tokenUsageActionModel.create({
      createPayload: {
        userId,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
      },
    });
  }

  /**
   * Retrieves the token usage history for a specific user.
   * Currently fetches the last 100 records ordered by creation date (newest first).
   *
   * @param userId - The ID of the user to fetch usage for.
   * @returns A paginated list of token usage records.
   */
  async getUserUsage(userId: string) {
    return this.tokenUsageActionModel.list({
      filterRecordOptions: { userId },
      paginationPayload: { page: 1, limit: 100 },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Calculates the total token usage for a specific user.
   *
   * @param userId - The ID of the user to fetch usage for.
   * @returns The total number of tokens used by the user.
   */
  async calculateTotalUsage(userId: string): Promise<number> {
    return this.tokenUsageActionModel.sumTotalTokens(userId);
  }

  /**
   * Calculates the token usage for a user since a specific date.
   * Typically used to calculate usage within the current billing cycle.
   *
   * @param userId - The ID of the user.
   * @param since - The start date of the period (e.g., billing cycle start).
   * @returns The total tokens used since the given date.
   */
  async calculateMonthlyUsage(userId: string, since: Date): Promise<number> {
    return this.tokenUsageActionModel.sumTokensSince(userId, since);
  }
}
