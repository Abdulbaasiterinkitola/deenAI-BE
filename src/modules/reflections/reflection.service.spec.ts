import { Test, TestingModule } from '@nestjs/testing';
import { ReflectionsService } from './reflections.service';
import { ReflectionsCoreService } from './services/reflections-core.service';
import { Reflection } from '@modules/reflections/models/reflection.model';
import { User } from '@modules/users/models/user.model';

describe('ReflectionsService', () => {
  let service: ReflectionsService;
  let coreService: jest.Mocked<ReflectionsCoreService>;

  const mockCoreService: Partial<jest.Mocked<ReflectionsCoreService>> = {
    createReflection: jest.fn(),
    getReflectionById: jest.fn(),
    updateReflection: jest.fn(),
    deleteReflection: jest.fn(),
    getUserReflections: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReflectionsService,
        { provide: ReflectionsCoreService, useValue: mockCoreService },
      ],
    }).compile();

    service = module.get(ReflectionsService);
    coreService = module.get(ReflectionsCoreService);
  });

  afterEach(() => jest.clearAllMocks());

  // Create reflections
  it('should call coreService.createReflection when creating', async () => {
    const dto = { type: 'quran', content: 'hello' };
    const userId = 'user123';

    const expected: Reflection = {
      id: 'uuid',
      content: 'hello',
      type: 'quran',
      surah: null,
      startAyah: null,
      endAyah: null,
      collectionId: null,
      hadithNumber: null,
      bookNumber: null,
      userId: 'user123',
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
        password: 'hashed',
      } as User,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    coreService.createReflection.mockResolvedValue(expected);

    const result = await service.createReflection(dto as any, userId);

    expect(coreService.createReflection).toHaveBeenCalledWith(dto, userId);
    expect(result).toEqual(expected);
  });

  // GET BY ID
  it('should call coreService.getReflectionById', async () => {
    const id = 'ref-1';
    const userId = 'user123';

    const expected = { id, content: 'test' } as any;
    coreService.getReflectionById.mockResolvedValue(expected);

    const result = await service.getReflectionById(id, userId);

    expect(coreService.getReflectionById).toHaveBeenCalledWith(id, userId);
    expect(result).toEqual(expected);
  });

  // UPDATE
  it('should call coreService.updateReflection', async () => {
    const id = 'ref-1';
    const userId = 'user123';
    const payload = { content: 'updated' };

    const expected = { id, ...payload } as any;
    coreService.updateReflection.mockResolvedValue(expected);

    const result = await service.updateReflection(id, payload as any, userId);

    expect(coreService.updateReflection).toHaveBeenCalledWith(
      id,
      payload,
      userId,
    );
    expect(result).toEqual(expected);
  });

  // DELETE
  it('should call coreService.deleteReflection', async () => {
    const id = 'ref-1';
    const userId = 'user123';

    coreService.deleteReflection.mockResolvedValue(undefined);

    await service.deleteReflection(id, userId);

    expect(coreService.deleteReflection).toHaveBeenCalledWith(id, userId);
  });

  // GET USER REFLECTIONS (pagination)
  it('should call coreService.getUserReflections', async () => {
    const userId = 'user123';
    const query = { page: 1, limit: 10 } as any;

    const expected = {
      payload: [],
      paginationMeta: { total: 0 },
    };

    coreService.getUserReflections.mockResolvedValue(expected);

    const result = await service.getUserReflections(userId, query);

    expect(coreService.getUserReflections).toHaveBeenCalledWith(userId, query);

    expect(result).toEqual(expected);
  });
});
