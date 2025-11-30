import { Test, TestingModule } from '@nestjs/testing';
import { NotificationSettingsService } from '../notification-settings.service';
import { NotificationSettingsCoreService } from './notification-settings-core.service';
import { UpdateNotificationSettingsDto } from '../dtos/update-notification-settings.dto';
import { EntityManager } from 'typeorm';

// Mock implementation for CoreService
const mockCoreService = {
  getSettings: jest.fn(),
  createUserNotification: jest.fn(),
  updateSettings: jest.fn(),
  deleteUserNotification: jest.fn(),
};

describe('NotificationSettingsService', () => {
  let service: NotificationSettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationSettingsService,
        {
          provide: NotificationSettingsCoreService,
          useValue: mockCoreService,
        },
      ],
    }).compile();

    service = module.get<NotificationSettingsService>(
      NotificationSettingsService,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call coreService.createUserNotification on createUserNotificationSettings', async () => {
    const userId = 'user-123';
    await service.createUserNotificationSettings(userId);
    expect(mockCoreService.createUserNotification).toHaveBeenCalledWith(
      userId,
      undefined,
    );
  });

  it('should call coreService.updateSettings on updateUserNotificationSettings', async () => {
    const userId = 'user-123';
    const dto: UpdateNotificationSettingsDto = { aiAlerts: false };
    await service.updateUserNotificationSettings(userId, dto);
    expect(mockCoreService.updateSettings).toHaveBeenCalledWith(userId, dto);
  });

  it('should call coreService.deleteUserNotification on deleteUserNotificationSettingsWithTransaction', async () => {
    const userId = 'user-123';
    const mockTransactionManager = {} as EntityManager;
    await service.deleteUserNotificationSettingsWithTransaction(
      userId,
      mockTransactionManager,
    );
    expect(mockCoreService.deleteUserNotification).toHaveBeenCalledWith(
      userId,
      mockTransactionManager,
    );
  });
});
