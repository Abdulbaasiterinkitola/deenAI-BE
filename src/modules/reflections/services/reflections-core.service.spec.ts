import { Test, TestingModule } from '@nestjs/testing';
import { ReflectionsCoreService } from './reflections-core.service';
import { ReflectionsActionModel } from '../action-models/reflections.action-model';
import { ReflectionsValidationService } from './reflections-validation.service';
import { Reflection } from '../models/reflection.model';
import { User } from '@modules/users/models/user.model';
import { AuthProvider } from '@modules/users/enums';
import {
  CreateReflectionType,
  UpdateReflectionType,
  ReflectionQueryType,
} from '../types/reflection';

describe('ReflectionsCoreService', () => {
  let service: ReflectionsCoreService;
  let reflectionsActionModel: jest.Mocked<ReflectionsActionModel>;
  let reflectionsValidationService: jest.Mocked<ReflectionsValidationService>;

  const mockUser: User = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    password: 'password',
    authProvider: AuthProvider.LOCAL,
    isEmailVerified: true,
    currentRefreshToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockReflection: Reflection = {
    id: 'test-reflection-id',
    content: 'Test reflection content',
    userId: 'test-user-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockUser,
  };

  beforeEach(async () => {
    const mockReflectionsActionModel = {
      create: jest.fn(),
      findByIdAndUserId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByUserId: jest.fn(),
    };

    const mockReflectionsValidationService = {
      validateReflectionContent: jest.fn(),
      validateReflectionOwnership: jest.fn(),
      validateReflectionId: jest.fn(),
      validatePaginationParams: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReflectionsCoreService,
        {
          provide: ReflectionsActionModel,
          useValue: mockReflectionsActionModel,
        },
        {
          provide: ReflectionsValidationService,
          useValue: mockReflectionsValidationService,
        },
      ],
    }).compile();

    service = module.get<ReflectionsCoreService>(ReflectionsCoreService);
    reflectionsActionModel = module.get(ReflectionsActionModel);
    reflectionsValidationService = module.get(ReflectionsValidationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createReflection', () => {
    it('should create a reflection successfully', async () => {
      // Arrange
      const createPayload: CreateReflectionType = {
        content: 'Test reflection content',
        userId: 'test-user-id',
      };
      const userId = 'test-user-id';
      reflectionsValidationService.validateReflectionContent.mockImplementation(
        () => {},
      );
      reflectionsActionModel.create.mockResolvedValue(mockReflection);

      // Act
      const result = await service.createReflection(createPayload, userId);

      // Assert
      expect(
        reflectionsValidationService.validateReflectionContent,
      ).toHaveBeenCalledWith(createPayload.content);
      expect(reflectionsActionModel.create).toHaveBeenCalledWith({
        createPayload: {
          ...createPayload,
          userId,
        },
      });
      expect(result).toEqual(mockReflection);
    });

    it('should throw an error if reflection creation fails', async () => {
      // Arrange
      const createPayload: CreateReflectionType = {
        content: 'Test reflection content',
        userId: 'test-user-id',
      };
      const userId = 'test-user-id';
      reflectionsValidationService.validateReflectionContent.mockImplementation(
        () => {},
      );
      reflectionsActionModel.create.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.createReflection(createPayload, userId),
      ).rejects.toThrow('Failed to create reflection');
    });
  });

  describe('getReflectionById', () => {
    it('should get a reflection by ID successfully', async () => {
      // Arrange
      const id = 'test-reflection-id';
      const userId = 'test-user-id';
      reflectionsValidationService.validateReflectionId.mockImplementation(
        () => {},
      );
      reflectionsActionModel.findByIdAndUserId.mockResolvedValue(
        mockReflection,
      );
      reflectionsValidationService.validateReflectionOwnership.mockImplementation(
        () => {},
      );

      // Act
      const result = await service.getReflectionById(id, userId);

      // Assert
      expect(
        reflectionsValidationService.validateReflectionId,
      ).toHaveBeenCalledWith(id);
      expect(reflectionsActionModel.findByIdAndUserId).toHaveBeenCalledWith(
        id,
        userId,
      );
      expect(
        reflectionsValidationService.validateReflectionOwnership,
      ).toHaveBeenCalledWith(mockReflection, userId);
      expect(result).toEqual(mockReflection);
    });
  });

  describe('updateReflection', () => {
    it('should update a reflection successfully', async () => {
      // Arrange
      const id = 'test-reflection-id';
      const updatePayload: UpdateReflectionType = {
        content: 'Updated reflection content',
      };
      const userId = 'test-user-id';
      const updatedReflection = {
        ...mockReflection,
        content: updatePayload.content || mockReflection.content,
        generateId: jest.fn(),
      };

      reflectionsValidationService.validateReflectionId.mockImplementation(
        () => {},
      );
      reflectionsValidationService.validateReflectionContent.mockImplementation(
        () => {},
      );
      reflectionsActionModel.findByIdAndUserId.mockResolvedValue(
        mockReflection,
      );
      reflectionsValidationService.validateReflectionOwnership.mockImplementation(
        () => {},
      );
      reflectionsActionModel.update.mockResolvedValue(updatedReflection);

      // Act
      const result = await service.updateReflection(id, updatePayload, userId);

      // Assert
      expect(
        reflectionsValidationService.validateReflectionId,
      ).toHaveBeenCalledWith(id);
      expect(
        reflectionsValidationService.validateReflectionContent,
      ).toHaveBeenCalledWith(updatePayload.content);
      expect(reflectionsActionModel.findByIdAndUserId).toHaveBeenCalledWith(
        id,
        userId,
      );
      expect(
        reflectionsValidationService.validateReflectionOwnership,
      ).toHaveBeenCalledWith(mockReflection, userId);
      expect(reflectionsActionModel.update).toHaveBeenCalledWith({
        updatePayload,
        identifierOptions: { id },
      });
      expect(result).toEqual(updatedReflection);
    });

    it('should not validate content if not provided in update payload', async () => {
      // Arrange
      const id = 'test-reflection-id';
      const updatePayload: UpdateReflectionType = {};
      const userId = 'test-user-id';
      const updatedReflection = {
        ...mockReflection,
        generateId: jest.fn(),
      };

      reflectionsValidationService.validateReflectionId.mockImplementation(
        () => {},
      );
      reflectionsActionModel.findByIdAndUserId.mockResolvedValue(
        mockReflection,
      );
      reflectionsValidationService.validateReflectionOwnership.mockImplementation(
        () => {},
      );
      reflectionsActionModel.update.mockResolvedValue(updatedReflection);

      // Act
      const result = await service.updateReflection(id, updatePayload, userId);

      // Assert
      expect(
        reflectionsValidationService.validateReflectionId,
      ).toHaveBeenCalledWith(id);
      expect(
        reflectionsValidationService.validateReflectionContent,
      ).not.toHaveBeenCalled();
      expect(reflectionsActionModel.findByIdAndUserId).toHaveBeenCalledWith(
        id,
        userId,
      );
      expect(
        reflectionsValidationService.validateReflectionOwnership,
      ).toHaveBeenCalledWith(mockReflection, userId);
      expect(reflectionsActionModel.update).toHaveBeenCalledWith({
        updatePayload,
        identifierOptions: { id },
      });
      expect(result).toEqual(updatedReflection);
    });

    it('should throw an error if reflection update fails', async () => {
      // Arrange
      const id = 'test-reflection-id';
      const updatePayload: UpdateReflectionType = {
        content: 'Updated reflection content',
      };
      const userId = 'test-user-id';

      reflectionsValidationService.validateReflectionId.mockImplementation(
        () => {},
      );
      reflectionsValidationService.validateReflectionContent.mockImplementation(
        () => {},
      );
      reflectionsActionModel.findByIdAndUserId.mockResolvedValue(
        mockReflection,
      );
      reflectionsValidationService.validateReflectionOwnership.mockImplementation(
        () => {},
      );
      reflectionsActionModel.update.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateReflection(id, updatePayload, userId),
      ).rejects.toThrow('Failed to update reflection');
    });
  });

  describe('deleteReflection', () => {
    it('should delete a reflection successfully', async () => {
      // Arrange
      const id = 'test-reflection-id';
      const userId = 'test-user-id';
      reflectionsValidationService.validateReflectionId.mockImplementation(
        () => {},
      );
      reflectionsActionModel.findByIdAndUserId.mockResolvedValue(
        mockReflection,
      );
      reflectionsValidationService.validateReflectionOwnership.mockImplementation(
        () => {},
      );
      reflectionsActionModel.delete.mockImplementation(async () => {});

      // Act
      await service.deleteReflection(id, userId);

      // Assert
      expect(
        reflectionsValidationService.validateReflectionId,
      ).toHaveBeenCalledWith(id);
      expect(reflectionsActionModel.findByIdAndUserId).toHaveBeenCalledWith(
        id,
        userId,
      );
      expect(
        reflectionsValidationService.validateReflectionOwnership,
      ).toHaveBeenCalledWith(mockReflection, userId);
      expect(reflectionsActionModel.delete).toHaveBeenCalledWith({
        identifierOptions: { id },
      });
    });
  });

  describe('getUserReflections', () => {
    it('should get user reflections with default values', async () => {
      // Arrange
      const userId = 'test-user-id';
      const query: ReflectionQueryType = {};
      const expectedResult = {
        payload: [mockReflection],
        paginationMeta: {
          total: 1,
          limit: 10,
          page: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      };

      reflectionsValidationService.validatePaginationParams.mockImplementation(
        () => {},
      );
      reflectionsActionModel.findByUserId.mockResolvedValue(expectedResult);

      // Act
      const result = await service.getUserReflections(userId, query);

      // Assert
      expect(
        reflectionsValidationService.validatePaginationParams,
      ).toHaveBeenCalledWith(undefined, undefined);
      expect(reflectionsActionModel.findByUserId).toHaveBeenCalledWith(userId, {
        paginationPayload: { page: 1, limit: 10 },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should get user reflections with provided values', async () => {
      // Arrange
      const userId = 'test-user-id';
      const query: ReflectionQueryType = {
        page: 2,
        limit: 5,
        orderBy: 'ASC',
      };
      const expectedResult = {
        payload: [mockReflection],
        paginationMeta: {
          total: 1,
          limit: 5,
          page: 2,
          totalPages: 1,
          hasNext: false,
          hasPrevious: true,
        },
      };

      reflectionsValidationService.validatePaginationParams.mockImplementation(
        () => {},
      );
      reflectionsActionModel.findByUserId.mockResolvedValue(expectedResult);

      // Act
      const result = await service.getUserReflections(userId, query);

      // Assert
      expect(
        reflectionsValidationService.validatePaginationParams,
      ).toHaveBeenCalledWith(2, 5);
      expect(reflectionsActionModel.findByUserId).toHaveBeenCalledWith(userId, {
        paginationPayload: { page: 2, limit: 5 },
        order: { createdAt: 'ASC' },
      });
      expect(result).toEqual(expectedResult);
    });
  });
});
