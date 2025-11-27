import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';

/**
 * Service for handling timezone-related operations
 * Provides utilities for timezone conversion and date comparisons
 */
@Injectable()
export class TimezoneService {
    /**
     * Get effective timezone for a user
     * Returns user's timezone if set, otherwise defaults to UTC
     * @param user - User object with optional timezone field
     * @returns IANA timezone string
     */
    getEffectiveTimezone(user: { timezone?: string | null }): string {
        return user.timezone || 'UTC';
    }

    /**
     * Convert a Date object to user's timezone
     * @param date - JavaScript Date object to convert
     * @param timezone - IANA timezone identifier
     * @returns Luxon DateTime object in the specified timezone
     */
    convertToUserTimezone(date: Date, timezone: string): DateTime {
        return DateTime.fromJSDate(date).setZone(timezone);
    }

    /**
     * Check if two dates represent the same day in a given timezone
     * This is crucial for streak tracking and daily limits
     * @param dateA - First date to compare
     * @param dateB - Second date to compare
     * @param zone - IANA timezone identifier
     * @returns true if dates are on the same day in the specified timezone
     */
    isSameDayInZone(dateA: Date, dateB: Date, zone: string): boolean {
        const dtA = DateTime.fromJSDate(dateA).setZone(zone);
        const dtB = DateTime.fromJSDate(dateB).setZone(zone);
        return dtA.hasSame(dtB, 'day');
    }

    /**
     * Get the start of day in a specific timezone
     * @param date - Date to get start of day for
     * @param timezone - IANA timezone identifier
     * @returns DateTime representing start of day (00:00:00) in the timezone
     */
    getStartOfDayInZone(date: Date, timezone: string): DateTime {
        return DateTime.fromJSDate(date).setZone(timezone).startOf('day');
    }

    /**
     * Get the end of day in a specific timezone
     * @param date - Date to get end of day for
     * @param timezone - IANA timezone identifier
     * @returns DateTime representing end of day (23:59:59.999) in the timezone
     */
    getEndOfDayInZone(date: Date, timezone: string): DateTime {
        return DateTime.fromJSDate(date).setZone(timezone).endOf('day');
    }

    /**
     * Check if a date is today in a given timezone
     * @param date - Date to check
     * @param timezone - IANA timezone identifier
     * @returns true if the date is today in the specified timezone
     */
    isTodayInZone(date: Date, timezone: string): boolean {
        const now = DateTime.now().setZone(timezone);
        const dateInZone = DateTime.fromJSDate(date).setZone(timezone);
        return now.hasSame(dateInZone, 'day');
    }
}
