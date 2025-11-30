import { Test, TestingModule } from '@nestjs/testing';
import { NotificationSettingsCoreService } from './notification-settings-core.service';
import { NotificationSettingsValidationService } from './notification-settings-validation.service';
import { NotificationSettingsModelAction } from '../model-actions/notification-settings.model-action';
import { NotificationSettings } from '../models/notification-setting.model';
import { UpdateNotificationSettingsDto } from '../dtos/update-notification-settings.dto';

// Mock implementation for ModelAction
const mockModelAction = {
  get: jest.fn(),
  list: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// Mock implementation for ValidationService
const mockValidationService = {
  validateSettingsExists: jest.fn(),
  validateOwnership: jest.fn(),
};

describe('NotificationSettingsCoreService', () => {
  let service: NotificationSettingsCoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationSettingsCoreService,
        {
          provide: NotificationSettingsModelAction,
          useValue: mockModelAction,
        },
        {
          provide: NotificationSettingsValidationService,
          useValue: mockValidationService,
        },
      ],
    }).compile();

    service = module.get<NotificationSettingsCoreService>(
      NotificationSettingsCoreService,
    );

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSettings', () => {
    it('should retrieve and return user settings', async () => {
      const userId = 'user-123';
      const mockSettings = { ...new NotificationSettings(), userId };
      mockModelAction.list.mockResolvedValue({ payload: [mockSettings] });
      mockValidationService.validateSettingsExists.mockReturnValue(
        mockSettings,
      );

      const result = await service.getSettings(userId);

      expect(mockModelAction.list).toHaveBeenCalledWith({
        filterRecordOptions: { userId },
        paginationPayload: { page: 1, limit: 1 },
      });
      expect(mockValidationService.validateSettingsExists).toHaveBeenCalledWith(
        mockSettings,
      );
      expect(result).toEqual(mockSettings);
    });
  });

  describe('createUserNotification', () => {
    it('should create default notification settings for a user', async () => {
      const userId = 'user-123';
      const defaultSettings = { userId };

      // Simulate that settings do not exist
      mockModelAction.list.mockResolvedValue({ payload: [] });
      mockModelAction.create.mockResolvedValue({
        ...new NotificationSettings(),
        ...defaultSettings,
      });

      await service.createUserNotification(userId);

      expect(mockModelAction.create).toHaveBeenCalledWith({
        createPayload: { userId },
      });
    });
  });

  describe('updateSettings', () => {
    it('should update and return the settings', async () => {
      const userId = 'user-123';
      const dto: UpdateNotificationSettingsDto = { prayerReminder: false };
      const existingSettings = {
        ...new NotificationSettings(),
        id: 'settings-id',
        userId,
      };
      const updatedSettings = { ...existingSettings, prayerReminder: false };

      // Mock the chain of calls
      jest.spyOn(service, 'getSettings').mockResolvedValue(existingSettings);
      mockValidationService.validateOwnership.mockImplementation(() => {});
      mockModelAction.update.mockResolvedValue(updatedSettings);

      const result = await service.updateSettings(userId, dto);

      expect(service.getSettings).toHaveBeenCalledWith(userId);
      expect(mockValidationService.validateOwnership).toHaveBeenCalledWith(
        existingSettings,
        userId,
      );
      expect(mockModelAction.update).toHaveBeenCalledWith({
        identifierOptions: { id: existingSettings.id },
        updatePayload: dto,
      });
      expect(result).toEqual(updatedSettings);
    });
  });

  describe('deleteUserNotification', () => {
    it('should delete a user notification settings', async () => {
      const userId = 'user-123';
      const mockSettings = {
        ...new NotificationSettings(),
        id: 'settings-id',
        userId,
      };
      // Simulate that settings exist
      mockModelAction.list.mockResolvedValue({ payload: [mockSettings] });
      mockModelAction.delete.mockResolvedValue({ affected: 1 });

      await service.deleteUserNotification(userId);

      expect(mockModelAction.delete).toHaveBeenCalledWith({
        identifierOptions: { id: mockSettings.id },
      });
    });
  });
});
