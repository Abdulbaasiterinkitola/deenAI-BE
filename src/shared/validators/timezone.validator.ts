import { CustomHttpException } from '@shared/custom.exception';
import { HttpStatus } from '@nestjs/common';

/**
 * Validator class for timezone-related operations
 * Validates IANA timezone format (e.g., America/New_York, Europe/London)
 */
export class TimezoneValidator {
    /**
     * List of common IANA timezone identifiers for validation
     * This is a subset of valid timezones - we validate format primarily
     */
    private static readonly COMMON_TIMEZONES = [
        'UTC',
        'America/New_York',
        'America/Chicago',
        'America/Denver',
        'America/Los_Angeles',
        'America/Toronto',
        'America/Mexico_City',
        'America/Sao_Paulo',
        'Europe/London',
        'Europe/Paris',
        'Europe/Berlin',
        'Europe/Madrid',
        'Europe/Rome',
        'Europe/Moscow',
        'Africa/Cairo',
        'Africa/Lagos',
        'Africa/Johannesburg',
        'Asia/Dubai',
        'Asia/Riyadh',
        'Asia/Tehran',
        'Asia/Karachi',
        'Asia/Kolkata',
        'Asia/Dhaka',
        'Asia/Bangkok',
        'Asia/Singapore',
        'Asia/Hong_Kong',
        'Asia/Tokyo',
        'Asia/Seoul',
        'Asia/Shanghai',
        'Australia/Sydney',
        'Australia/Melbourne',
        'Pacific/Auckland',
    ];

    /**
     * Validates timezone format
     * @param timezone - The timezone string to validate
     * @throws {CustomHttpException} When timezone format is invalid
     */
    static validateTimezone(timezone: string | null | undefined): void {
        // Allow null/undefined (optional field)
        if (!timezone) {
            return;
        }

        if (typeof timezone !== 'string') {
            throw new CustomHttpException(
                'Timezone must be a string',
                HttpStatus.BAD_REQUEST,
            );
        }

        // Special case: UTC is always valid
        if (timezone === 'UTC') {
            return;
        }

        // Validate IANA timezone format: Area/Location or Area/Location/City
        // Examples: America/New_York, Europe/London, America/Argentina/Buenos_Aires
        const ianaFormatRegex = /^[A-Z][a-z]+\/[A-Z][a-z_]+(?:\/[A-Z][a-z_]+)?$/;

        if (!ianaFormatRegex.test(timezone)) {
            throw new CustomHttpException(
                'Invalid timezone format. Use IANA timezone format (e.g., America/New_York, Europe/London, Asia/Dubai)',
                HttpStatus.BAD_REQUEST,
            );
        }

        // Optional: Check against common timezones list for better UX
        // This is not exhaustive but catches common mistakes
        const isCommonTimezone = this.COMMON_TIMEZONES.includes(timezone);
        if (!isCommonTimezone) {
            // Still allow it, but could log a warning in production
            // For now, we trust the format validation
        }
    }
}
