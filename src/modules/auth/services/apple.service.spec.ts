import { Test, TestingModule } from '@nestjs/testing';
import { AppleAuthService } from './apple.service';
import { UsersService } from '@modules/users/users.service';
import { ConfigService } from '@nestjs/config';
import { AuthValidationService } from './auth-validation.service';
import { AuthProvider } from '@modules/users/enums';
import { CustomHttpException } from '@shared/custom.exception';

describe('AppleAuthService', () => {
  let service: AppleAuthService;

  const usersServiceMock = {
    getUserByEmail: jest.fn(),
    createUser: jest.fn(),
    updateUserAuthProvider: jest.fn(),
  };

  const configServiceMock = {
    get: jest.fn(),
  };

  const authValidationMock = {
    validateUserEmail: jest.fn(),
    validateUserCreation: jest.fn(),
    validateAuthProviderConflict: jest.fn(),
    validateAuthProviderUpdate: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppleAuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
        { provide: AuthValidationService, useValue: authValidationMock },
      ],
    }).compile();

    service = module.get<AppleAuthService>(AppleAuthService);
  });

  it('should create a new user on first Apple login', async () => {
    configServiceMock.get.mockReturnValue('APPLE_CLIENT_ID');
    const payload = {
      email: 'newuser@apple.com',
      email_verified: 'true',
    };

    jest
      .spyOn<any, any>(service as any, 'verifyIdToken')
      .mockResolvedValue(payload);

    usersServiceMock.getUserByEmail
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'user-123',
        email: payload.email,
        authProvider: AuthProvider.APPLE,
      });

    const result = await service.authenticate('fake-token');

    expect(authValidationMock.validateUserEmail).toHaveBeenCalledWith(
      payload.email,
    );
    expect(authValidationMock.validateUserCreation).toHaveBeenCalledWith(
      payload.email,
      AuthProvider.APPLE,
      null,
    );
    expect(usersServiceMock.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: payload.email,
        authProvider: AuthProvider.APPLE,
        isEmailVerified: true,
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        id: 'user-123',
        email: payload.email,
        authProvider: AuthProvider.APPLE,
      }),
    );
  });

  it('should throw when Apple client id is missing', async () => {
    configServiceMock.get.mockReturnValue(undefined);

    await expect(service.authenticate('token')).rejects.toBeInstanceOf(
      CustomHttpException,
    );
  });

  it('should throw when token verification fails', async () => {
    configServiceMock.get.mockReturnValue('APPLE_CLIENT_ID');
    jest
      .spyOn<any, any>(service as any, 'verifyIdToken')
      .mockRejectedValue(new Error('bad token'));

    await expect(service.authenticate('token')).rejects.toBeTruthy();
  });
});
