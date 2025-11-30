import { Test, TestingModule } from '@nestjs/testing';
import { ReflectionsController } from './reflections.controller';
import { ReflectionsService } from './reflections.service';
import { CreateReflectionDto } from './dtos/reflection.dto';

describe('ReflectionsController', () => {
  let controller: ReflectionsController;
  let service: ReflectionsService;

  const mockReflectionsService = {
    createReflection: jest.fn(),
    getUserReflections: jest.fn(),
    getReflectionById: jest.fn(),
    updateReflection: jest.fn(),
    deleteReflection: jest.fn(),
  };

  const mockReq = {
    user: { id: 'user123' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReflectionsController],
      providers: [
        {
          provide: ReflectionsService,
          useValue: mockReflectionsService,
        },
      ],
    }).compile();

    controller = module.get<ReflectionsController>(ReflectionsController);
    service = module.get<ReflectionsService>(ReflectionsService);

    jest.clearAllMocks();
  });

  // ---------------------------------------------------------
  // CREATE
  // ---------------------------------------------------------
  describe('createReflection', () => {
    it('should call reflectionsService.createReflection with correct payload for quran type', async () => {
      const dto: CreateReflectionDto = {
        type: 'quran',
        content: 'My reflection',
        surah: 1,
        startAyah: 1,
        endAyah: 5,
      };

      const expected = { id: 'ref1', content: 'My reflection' };
      mockReflectionsService.createReflection.mockResolvedValue(expected);

      const result = await controller.createReflection(dto, mockReq);

      expect(service.createReflection).toHaveBeenCalledWith(
        {
          type: 'quran',
          content: 'My reflection',
          surah: 1,
          startAyah: 1,
          endAyah: 5,
        },
        'user123',
      );
      expect(result).toEqual(expected);
    });

    it('should call reflectionsService.createReflection with correct payload for hadith type', async () => {
      const dto: CreateReflectionDto = {
        type: 'hadith',
        content: 'My hadith reflection',
        collectionId: 'bukhari',
        bookNumber: 1,
        hadithNumber: 1,
      };

      const expected = { id: 'ref2', content: 'My hadith reflection' };
      mockReflectionsService.createReflection.mockResolvedValue(expected);

      const result = await controller.createReflection(dto, mockReq);

      expect(service.createReflection).toHaveBeenCalledWith(
        {
          type: 'hadith',
          content: 'My hadith reflection',
          collectionId: 'bukhari',
          bookNumber: 1,
          hadithNumber: 1,
        },
        'user123',
      );
      expect(result).toEqual(expected);
    });
  });

  // ---------------------------------------------------------
  // GET ALL USER REFLECTIONS
  // ---------------------------------------------------------
  describe('getUserReflections', () => {
    it('should fetch user reflections with query params', async () => {
      const query = { page: 1, limit: 10 };
      const expected = { data: [], total: 0 };

      mockReflectionsService.getUserReflections.mockResolvedValue(expected);

      const result = await controller.getUserReflections(query, mockReq);

      expect(service.getUserReflections).toHaveBeenCalledWith('user123', query);
      expect(result).toEqual(expected);
    });
  });

  // ---------------------------------------------------------
  // GET BY ID
  // ---------------------------------------------------------
  describe('getReflectionById', () => {
    it('should return a reflection by ID', async () => {
      const expected = { id: 'ref1', content: 'Test reflection' };

      mockReflectionsService.getReflectionById.mockResolvedValue(expected);

      const result = await controller.getReflectionById(
        { id: 'ref1' },
        mockReq,
      );

      expect(service.getReflectionById).toHaveBeenCalledWith('ref1', 'user123');
      expect(result).toEqual(expected);
    });

    it('should propagate errors from the service', async () => {
      const error = new Error('Test Error');
      mockReflectionsService.getReflectionById.mockRejectedValue(error);

      await expect(
        controller.getReflectionById({ id: 'ref1' }, mockReq),
      ).rejects.toThrow(error);
    });
  });

  // ---------------------------------------------------------
  // UPDATE
  // ---------------------------------------------------------
  describe('updateReflection', () => {
    it('should update a reflection', async () => {
      const dto = { content: 'Updated content' };
      const expected = { id: 'ref1', content: 'Updated content' };

      mockReflectionsService.updateReflection.mockResolvedValue(expected);

      const result = await controller.updateReflection(
        { id: 'ref1' },
        dto,
        mockReq,
      );

      expect(service.updateReflection).toHaveBeenCalledWith(
        'ref1',
        dto,
        'user123',
      );
      expect(result).toEqual(expected);
    });
  });

  // ---------------------------------------------------------
  // DELETE
  // ---------------------------------------------------------
  describe('deleteReflection', () => {
    it('should delete a reflection', async () => {
      mockReflectionsService.deleteReflection.mockResolvedValue(undefined);

      const result = await controller.deleteReflection({ id: 'ref1' }, mockReq);

      expect(service.deleteReflection).toHaveBeenCalledWith('ref1', 'user123');

      expect(result).toEqual({
        message: 'Reflection deleted successfully',
      });
    });
  });
});
