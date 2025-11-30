import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { NotificationSettingsValidationService } from './notification-settings-validation.service';
import { NotificationSettings } from '../models/notification-setting.model';
import { CustomHttpException } from '@shared/custom.exception';

describe('NotificationSettingsValidationService', () => {
  let service: NotificationSettingsValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationSettingsValidationService],
    }).compile();

    service = module.get<NotificationSettingsValidationService>(
      NotificationSettingsValidationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateSettingsExists', () => {
    it('should return the settings object if it exists', () => {
      const settings = new NotificationSettings();
      expect(service.validateSettingsExists(settings)).toEqual(settings);
    });

    it('should throw a NOT_FOUND exception if settings are null', () => {
      try {
        service.validateSettingsExists(null);
      } catch (error) {
        expect(error).toBeInstanceOf(CustomHttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(error.message).toBe('Notification settings not found');
      }
    });
  });

  describe('validateOwnership', () => {
    const userId = 'user-123';
    const otherUserId = 'user-456';
    let settings: NotificationSettings;

    beforeEach(() => {
      settings = new NotificationSettings();
      settings.userId = userId;
    });

    it('should not throw an error if the user owns the settings', () => {
      expect(() => service.validateOwnership(settings, userId)).not.toThrow();
    });

    it('should throw a FORBIDDEN exception if the user does not own the settings', () => {
      try {
        service.validateOwnership(settings, otherUserId);
      } catch (error) {
        expect(error).toBeInstanceOf(CustomHttpException);
        expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
        expect(error.message).toBe(
          'You are not authorized to update these settings',
        );
      }
    });
  });
});
