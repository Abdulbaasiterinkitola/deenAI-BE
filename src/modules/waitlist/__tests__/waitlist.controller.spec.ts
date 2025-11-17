import { Test, TestingModule } from '@nestjs/testing';
import { WaitlistController } from '../waitlist.controller';
import { WaitlistService } from '../waitlist.service';

describe('WaitlistController', () => {
  let controller: WaitlistController;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WaitlistController],
      providers: [
        {
          provide: WaitlistService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<WaitlistController>(WaitlistController);
  });

  describe('create', () => {
    it('should create waitlist entry', async () => {
      const createDto = { name: 'John Doe', email: 'john@example.com' };
      const expectedResult = {
        message: 'Successfully joined waitlist',
        data: { id: 'uuid-123', ...createDto },
      };

      mockService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(mockService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all waitlist entries', async () => {
      const expectedEntries = [
        { id: '1', name: 'John', email: 'john@example.com' },
        { id: '2', name: 'Jane', email: 'jane@example.com' },
      ];

      mockService.findAll.mockResolvedValue(expectedEntries);

      const result = await controller.findAll();

      expect(mockService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedEntries);
    });
  });
});
