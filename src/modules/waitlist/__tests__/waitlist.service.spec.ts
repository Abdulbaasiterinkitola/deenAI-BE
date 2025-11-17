import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { WaitlistService } from '../waitlist.service';
import { Waitlist } from '../../../entities/waitlist.entity';
import { MailService } from '../../mail/mail.service';

describe('WaitlistService', () => {
  let service: WaitlistService;
  let mockRepository: any;
  let mockMailService: any;

  beforeEach(async () => {
    mockRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    mockMailService = {
      sendWelcomeEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaitlistService,
        {
          provide: getRepositoryToken(Waitlist),
          useValue: mockRepository,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<WaitlistService>(WaitlistService);
  });

  describe('create', () => {
    const createWaitlistDto = {
      name: 'John Doe',
      email: 'john@example.com',
    };

    it('should create waitlist entry successfully', async () => {
      const savedEntry = {
        id: 'uuid-123',
        ...createWaitlistDto,
        status: 'pending',
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(savedEntry);
      mockRepository.save.mockResolvedValue(savedEntry);
      mockMailService.sendWelcomeEmail.mockResolvedValue(undefined);

      const result = await service.create(createWaitlistDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: createWaitlistDto.email },
      });
      expect(mockRepository.create).toHaveBeenCalledWith(createWaitlistDto);
      expect(mockRepository.save).toHaveBeenCalledWith(savedEntry);
      expect(mockMailService.sendWelcomeEmail).toHaveBeenCalledWith(
        savedEntry.email,
        savedEntry.name,
      );
      expect(result.message).toBe('Successfully joined waitlist');
      expect(result.data.email).toBe(createWaitlistDto.email);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockRepository.findOne.mockResolvedValue({ id: 'existing-id' });

      await expect(service.create(createWaitlistDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockMailService.sendWelcomeEmail).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all waitlist entries ordered by creation date', async () => {
      const mockEntries = [
        { id: '1', name: 'John', email: 'john@example.com' },
        { id: '2', name: 'Jane', email: 'jane@example.com' },
      ];

      mockRepository.find.mockResolvedValue(mockEntries);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockEntries);
    });
  });
});
