import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { StreaksCoreService } from './streaks-core.service';

@Injectable()
export class StreaksCleanupService {
  private readonly logger = new Logger(StreaksCleanupService.name);

  constructor(private readonly streaksCoreService: StreaksCoreService) {}

  /**
   * Background job that runs every hour to reset streaks that haven't been updated in 24+ hours
   * Cron expression: '0 * * * *' = every hour at minute 0
   */
  @Cron('0 * * * *')
  async resetExpiredStreaks() {
    this.logger.log('Starting streak cleanup job...');

    try {
      const resetCount = await this.streaksCoreService.resetExpiredStreaks();

      if (resetCount > 0) {
        this.logger.log(
          `Streak cleanup completed: ${resetCount} streak(s) reset to zero`,
        );
      } else {
        this.logger.log('Streak cleanup completed: No streaks needed reset');
      }
    } catch (error) {
      this.logger.error(
        `Error during streak cleanup: ${(error as Error).message}`,
        (error as Error).stack,
      );
    }
  }
}
