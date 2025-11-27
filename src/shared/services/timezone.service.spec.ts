import { Test, TestingModule } from '@nestjs/testing';
import { TimezoneService } from './timezone.service';
import { DateTime } from 'luxon';

describe('TimezoneService', () => {
    let service: TimezoneService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TimezoneService],
        }).compile();

        service = module.get<TimezoneService>(TimezoneService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getEffectiveTimezone', () => {
        it('should return user timezone when set', () => {
            const user = { timezone: 'America/New_York' };
            expect(service.getEffectiveTimezone(user)).toBe('America/New_York');
        });

        it('should return UTC when user timezone is null', () => {
            const user = { timezone: null };
            expect(service.getEffectiveTimezone(user)).toBe('UTC');
        });

        it('should return UTC when user timezone is undefined', () => {
            const user = {};
            expect(service.getEffectiveTimezone(user)).toBe('UTC');
        });
    });

    describe('convertToUserTimezone', () => {
        it('should convert date to user timezone', () => {
            const date = new Date('2025-01-15T12:00:00Z');
            const result = service.convertToUserTimezone(date, 'America/New_York');

            expect(result).toBeInstanceOf(DateTime);
            expect(result.zoneName).toBe('America/New_York');
        });

        it('should handle UTC timezone', () => {
            const date = new Date('2025-01-15T12:00:00Z');
            const result = service.convertToUserTimezone(date, 'UTC');

            expect(result.zoneName).toBe('UTC');
        });
    });

    describe('isSameDayInZone', () => {
        it('should return true for same day in timezone', () => {
            const dateA = new Date('2025-01-15T23:00:00Z'); // 6 PM EST
            const dateB = new Date('2025-01-16T03:00:00Z'); // 10 PM EST (same day)

            const result = service.isSameDayInZone(
                dateA,
                dateB,
                'America/New_York',
            );
            expect(result).toBe(true);
        });

        it('should return false for different days in timezone', () => {
            const dateA = new Date('2025-01-15T03:00:00Z'); // Jan 14, 10 PM EST
            const dateB = new Date('2025-01-15T06:00:00Z'); // Jan 15, 1 AM EST

            const result = service.isSameDayInZone(
                dateA,
                dateB,
                'America/New_York',
            );
            expect(result).toBe(false);
        });

        it('should handle UTC timezone', () => {
            const dateA = new Date('2025-01-15T12:00:00Z');
            const dateB = new Date('2025-01-15T23:00:00Z');

            const result = service.isSameDayInZone(dateA, dateB, 'UTC');
            expect(result).toBe(true);
        });
    });

    describe('getStartOfDayInZone', () => {
        it('should return start of day in timezone', () => {
            const date = new Date('2025-01-15T15:30:00Z');
            const result = service.getStartOfDayInZone(date, 'America/New_York');

            expect(result.hour).toBe(0);
            expect(result.minute).toBe(0);
            expect(result.second).toBe(0);
        });
    });

    describe('getEndOfDayInZone', () => {
        it('should return end of day in timezone', () => {
            const date = new Date('2025-01-15T15:30:00Z');
            const result = service.getEndOfDayInZone(date, 'America/New_York');

            expect(result.hour).toBe(23);
            expect(result.minute).toBe(59);
            expect(result.second).toBe(59);
        });
    });

    describe('isTodayInZone', () => {
        it('should return true for current date in timezone', () => {
            const now = new Date();
            const result = service.isTodayInZone(now, 'America/New_York');

            expect(result).toBe(true);
        });

        it('should return false for past date', () => {
            const pastDate = new Date('2020-01-01T12:00:00Z');
            const result = service.isTodayInZone(pastDate, 'America/New_York');

            expect(result).toBe(false);
        });
    });
});
