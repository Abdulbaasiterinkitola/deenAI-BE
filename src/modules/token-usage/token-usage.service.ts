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
}
