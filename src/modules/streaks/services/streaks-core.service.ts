import { HttpStatus, Injectable } from '@nestjs/common';
import { StreakActionModel } from '../action-models/streak.model-action';
import { EntityManager } from 'typeorm';
import { CustomHttpException } from '@shared/custom.exception';
import { DateTime } from 'luxon';

@Injectable()
export class StreaksCoreService {
  constructor(private readonly streakActionModel: StreakActionModel) {}

  /**
   * Creates a new streak record for a user
   * @param userId - The user ID to create a streak for
   * @param transaction - Optional transaction manager for database operations within a transaction
   * @returns Promise that resolves when the streak is created
   */
  async createStreak(userId: string, transaction?: EntityManager) {
    await this.streakActionModel.create({
      createPayload: {
        userId,
      },
      ...(transaction
        ? {
            transactionOptions: {
              useTransaction: true,
              transaction,
            },
          }
        : {}),
    });
  }

  /**
   * Updates the streak for an authenticated user
   * Validates that the streak can be updated before performing the update
   * @param userId - The user ID to update streak for
   * @returns The updated streak record
   */
  async updateStreak(userId: string, completedAtUtc: Date, timezone: string) {
    const streak = await this.streakActionModel.get({ userId });

    if (!streak) {
      throw new CustomHttpException(
        'Streak record not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (!(completedAtUtc instanceof Date) || isNaN(completedAtUtc.getTime())) {
      throw new CustomHttpException(
        'Invalid completedAt date received.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const completionDate =
      DateTime.fromJSDate(completedAtUtc).setZone(timezone);

    if (
      completionDate > DateTime.now().setZone(timezone).plus({ minutes: 5 })
    ) {
      throw new CustomHttpException(
        'completedAt cannot be in the future.',
        HttpStatus.BAD_REQUEST,
      );
    }

    let newCurrentStreak = 1;

    if (streak.lastCompletedAt) {
      const lastCompletion = DateTime.fromJSDate(
        streak.lastCompletedAt,
      ).setZone(timezone);

      const dayDiff = Math.floor(
        completionDate
          .startOf('day')
          .diff(lastCompletion.startOf('day'), 'days').days,
      );

      if (dayDiff < 0) {
        throw new CustomHttpException(
          'completedAt cannot be earlier than the last recorded completion.',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (dayDiff === 0) {
        const now = DateTime.now().setZone(timezone);
        const nextDayStart = lastCompletion.plus({ days: 1 }).startOf('day');
        const remainingHours = Math.max(
          1,
          Math.ceil(nextDayStart.diff(now, 'hours').hours),
        );
        throw new CustomHttpException(
          `Streak can only be updated once per day. Please try again in ${remainingHours} hour(s).`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      newCurrentStreak = dayDiff === 1 ? streak.currentStreak + 1 : 1;
    }

    const newHighestStreak = Math.max(streak.highestStreak, newCurrentStreak);

    const updatedStreak = await this.streakActionModel.update({
      identifierOptions: {
        userId,
      },
      updatePayload: {
        currentStreak: newCurrentStreak,
        highestStreak: newHighestStreak,
        lastCompletedAt: completionDate.toUTC().toJSDate(),
      },
    });

    if (!updatedStreak) {
      throw new CustomHttpException(
        'Failed to update streak',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      message: 'Streak updated successfully',
      data: updatedStreak,
    };
  }

  /**
   * Gets the current streak state for a user
   * @param userId - The user ID to get streak state for
   * @param timezone - The user's timezone
   * @returns The streak state including whether it can be updated today
   */
  async getStreakState(userId: string, timezone: string) {
    const streak = await this.streakActionModel.get({ userId });

    if (!streak) {
      throw new CustomHttpException(
        'Streak record not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const now = DateTime.now().setZone(timezone);
    let canUpdateToday = true;
    let nextUpdateAvailableAt: string | null = null;
    let lastCompletedAtWithTimeZone: string | null = null;

    if (streak.lastCompletedAt) {
      const lastCompletion = DateTime.fromJSDate(
        streak.lastCompletedAt,
      ).setZone(timezone);

      lastCompletedAtWithTimeZone = lastCompletion.toISO();

      const dayDiff = Math.floor(
        now.startOf('day').diff(lastCompletion.startOf('day'), 'days').days,
      );

      // If last completion was today, can't update again
      if (dayDiff === 0) {
        canUpdateToday = false;
        const nextDayStart = lastCompletion.plus({ days: 1 }).startOf('day');
        nextUpdateAvailableAt = nextDayStart.toUTC().toISO();
      }
    }

    return {
      id: streak.id,
      userId: streak.userId,
      type: streak.type,
      currentStreak: streak.currentStreak,
      highestStreak: streak.highestStreak,
      lastCompletedAt: streak.lastCompletedAt
        ? streak.lastCompletedAt.toISOString()
        : null,
      lastCompletedAtWithTimeZone,
      canUpdateToday,
      nextUpdateAvailableAt,
      timezone,
      createdAt: streak.createdAt,
      updatedAt: streak.updatedAt,
    };
  }

  /**
   * Validates if a streak can be updated for a user
   * @param userId - The user ID to check streak for
   * @throws {CustomHttpException} When streak cannot be updated
   * @returns The streak record if validation passes
   */
  // validateStreakCanBeUpdated removed – new timezone-aware logic handled in updateStreak

  /**
   * Resets streaks to zero for users who haven't completed their streak in 24+ hours
   * This is called by a background job to maintain streak integrity
   * Uses a single SQL UPDATE query for optimal performance
   * @returns Number of streaks reset
   */
  async resetExpiredStreaks(): Promise<number> {
    // Calculate the timestamp for 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Single SQL query to update all expired streaks at once
    // Using RETURNING to get the count of updated rows
    const result = await this.streakActionModel.customQuery(
      `
      UPDATE streaks
      SET current_streak = 0, updated_at = NOW()
      WHERE current_streak > 0
        AND last_completed_at IS NOT NULL
        AND last_completed_at < $1
      RETURNING id
      `,
      [twentyFourHoursAgo],
    );

    // Return the number of rows affected (length of returned array)
    return Array.isArray(result) ? result.length : 0;
  }
}
