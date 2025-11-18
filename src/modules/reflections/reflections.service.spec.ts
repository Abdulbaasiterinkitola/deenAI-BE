import { Test, TestingModule } from '@nestjs/testing';
import { ReflectionsService } from './reflections.service';
import { ReflectionsCoreService } from './services/reflections-core.service';
import { Reflection } from './models/reflection.model';
import { User } from '@modules/users/models/user.model';
import { AuthProvider } from '@modules/users/enums';
import { CreateReflectionType, UpdateReflectionType, ReflectionQueryType } from './types/reflection';

describe('ReflectionsService', () => {
  let service: ReflectionsService;
  let reflectionsCoreService: jest.Mocked<ReflectionsCoreService>;

  const mockUser: User = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    password: 'password',
    authProvider: AuthProvider.LOCAL,
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    generateId: jest.fn(),
  };

  const mockReflection: Reflection = {
    id: 'test-reflection-id',
    content: 'Test reflection content',
    userId: 'test-user-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockUser,
    generateId: jest.fn(),
  };

  beforeEach(async () => {
    const mockReflectionsCoreService = {
      createReflection: jest.fn(),
      getReflectionById: jest.fn(),
      updateReflection: jest.fn(),
      deleteReflection: jest.fn(),
      getUserReflections: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReflectionsService,
        {
          provide: ReflectionsCoreService,
          useValue: mockReflectionsCoreService,
        },
      ],
    }).compile();

    service = module.get<ReflectionsService>(ReflectionsService);
    reflectionsCoreService = module.get(ReflectionsCoreService) as jest.Mocked<ReflectionsCoreService>;
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
      reflectionsCoreService.createReflection.mockResolvedValue(mockReflection);

      // Act
      const result = await service.createReflection(createPayload, userId);

      // Assert
      expect(reflectionsCoreService.createReflection).toHaveBeenCalledWith(createPayload, userId);
      expect(result).toEqual(mockReflection);
    });
  });

  describe('getReflectionById', () => {
    it('should get a reflection by ID successfully', async () => {
      // Arrange
      const id = 'test-reflection-id';
      const userId = 'test-user-id';
      reflectionsCoreService.getReflectionById.mockResolvedValue(mockReflection);

      // Act
      const result = await service.getReflectionById(id, userId);

      // Assert
      expect(reflectionsCoreService.getReflectionById).toHaveBeenCalledWith(id, userId);
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
      reflectionsCoreService.updateReflection.mockResolvedValue(updatedReflection);

      // Act
      const result = await service.updateReflection(id, updatePayload, userId);

      // Assert
      expect(reflectionsCoreService.updateReflection).toHaveBeenCalledWith(id, updatePayload, userId);
      expect(result).toEqual(updatedReflection);
    });
  });

  describe('deleteReflection', () => {
    it('should delete a reflection successfully', async () => {
      // Arrange
      const id = 'test-reflection-id';
      const userId = 'test-user-id';
      reflectionsCoreService.deleteReflection.mockResolvedValue(undefined);

      // Act
      await service.deleteReflection(id, userId);

      // Assert
      expect(reflectionsCoreService.deleteReflection).toHaveBeenCalledWith(id, userId);
    });
  });

  describe('getUserReflections', () => {
    it('should get user reflections successfully', async () => {
      // Arrange
      const userId = 'test-user-id';
      const query: ReflectionQueryType = {
        page: 1,
        limit: 10,
        orderBy: 'DESC',
      };
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
      reflectionsCoreService.getUserReflections.mockResolvedValue(expectedResult);

      // Act
      const result = await service.getUserReflections(userId, query);

      // Assert
      expect(reflectionsCoreService.getUserReflections).toHaveBeenCalledWith(userId, query);
      expect(result).toEqual(expectedResult);
    });
  });
});