import { Test, TestingModule } from '@nestjs/testing';
import { PlansCoreService } from './plans-core.service';
import { PlanModelAction } from '../model-actions/plan.model-action';
import { Plan } from '../models/plan.model';

describe('PlansCoreService', () => {
  let service: PlansCoreService;
  let planModelAction: PlanModelAction;

  // Mock Data
  const mockPlan = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Premium Plan',
    slug: 'premium',
    displayOrder: 1,
  } as Plan;

  const mockPaginationMeta = {
    total: 1,
    limit: 10,
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  };

  const planModelActionMock = {
    list: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlansCoreService,
        { provide: PlanModelAction, useValue: planModelActionMock },
      ],
    }).compile();

    service = module.get<PlansCoreService>(PlansCoreService);
    planModelAction = module.get<PlanModelAction>(PlanModelAction);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listPlans', () => {
    it('should return a list of plans with pagination meta', async () => {
      planModelActionMock.list.mockResolvedValue({
        payload: [mockPlan],
        paginationMeta: mockPaginationMeta,
      });

      const query = { page: 1, limit: 10 };
      const result = await service.listPlans(query);

      expect(planModelAction.list).toHaveBeenCalledWith({
        paginationPayload: { page: 1, limit: 10 },
        order: { displayOrder: 'ASC' },
      });
      expect(result).toEqual({
        items: [mockPlan],
        paginationMeta: mockPaginationMeta,
      });
    });

    it('should use default pagination values if not provided', async () => {
      planModelActionMock.list.mockResolvedValue({
        payload: [],
        paginationMeta: mockPaginationMeta,
      });

      await service.listPlans({});

      expect(planModelAction.list).toHaveBeenCalledWith({
        paginationPayload: { page: 1, limit: 10 },
        order: { displayOrder: 'ASC' },
      });
    });
  });

  describe('getPlanById', () => {
    it('should return a plan if found', async () => {
      planModelActionMock.get.mockResolvedValue(mockPlan);

      const result = await service.getPlanById(mockPlan.id);

      expect(planModelAction.get).toHaveBeenCalledWith({ id: mockPlan.id });
      expect(result).toEqual(mockPlan);
    });

    it('should return null if plan not found', async () => {
      planModelActionMock.get.mockResolvedValue(null);

      const result = await service.getPlanById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('getPlanBySlug', () => {
    it('should return a plan if found by slug', async () => {
      planModelActionMock.get.mockResolvedValue(mockPlan);

      const result = await service.getPlanBySlug('premium');

      expect(planModelAction.get).toHaveBeenCalledWith({ slug: 'premium' });
      expect(result).toEqual(mockPlan);
    });
  });

  describe('seedDefaults', () => {
    const defaultPlans = [
      { slug: 'free', name: 'Free Plan' },
      { slug: 'premium', name: 'Premium Plan' },
    ];

    it('should update existing plans and create new ones', async () => {
      // Mock get to return a plan for 'free' (exists) and null for 'premium' (new)
      planModelActionMock.get
        .mockResolvedValueOnce({ id: 'existing-id', slug: 'free' }) // First call (free)
        .mockResolvedValueOnce(null); // Second call (premium)

      await service.seedDefaults(defaultPlans);

      // Verify update called for existing plan
      expect(planModelAction.update).toHaveBeenCalledWith({
        updatePayload: defaultPlans[0],
        identifierOptions: { id: 'existing-id' },
      });

      // Verify create called for new plan
      expect(planModelAction.create).toHaveBeenCalledWith({
        createPayload: defaultPlans[1],
      });
    });
  });
});