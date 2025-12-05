import { Test, TestingModule } from '@nestjs/testing';
import { PlansValidationService } from './plans-validation.service';
import { CustomHttpException } from '@shared/custom.exception';
import { HttpStatus } from '@nestjs/common';

describe('PlansValidationService', () => {
  let service: PlansValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlansValidationService],
    }).compile();

    service = module.get<PlansValidationService>(PlansValidationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validatePagination', () => {
    it('should validate correct pagination params', () => {
      expect(() => service.validatePagination(1, 10)).not.toThrow();
    });

    it('should allow undefined params (optional)', () => {
      expect(() =>
        service.validatePagination(undefined, undefined),
      ).not.toThrow();
    });

    it('should throw error for invalid page number', () => {
      try {
        service.validatePagination(0, 10);
      } catch (error) {
        expect(error).toBeInstanceOf(CustomHttpException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.getResponse().message).toContain(
          'page must be a positive integer',
        );
      }
    });

    it('should throw error for non-integer page', () => {
      expect(() => service.validatePagination(1.5, 10)).toThrow(
        CustomHttpException,
      );
    });

    it('should throw error for limit less than 1', () => {
      try {
        service.validatePagination(1, 0);
      } catch (error) {
        expect(error).toBeInstanceOf(CustomHttpException);
        expect(error.getResponse().message).toContain(
          'limit must be between 1 and 100',
        );
      }
    });

    it('should throw error for limit greater than 100', () => {
      expect(() => service.validatePagination(1, 101)).toThrow(
        CustomHttpException,
      );
    });
  });

  describe('validateId', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000';

    it('should validate a correct UUID', () => {
      expect(() => service.validateId(validUuid)).not.toThrow();
    });

    it('should throw error if ID is missing', () => {
      try {
        service.validateId('');
      } catch (error) {
        expect(error).toBeInstanceOf(CustomHttpException);
        expect(error.getResponse().message).toBe('Plan id is required');
      }
    });

    it('should throw error for invalid UUID format', () => {
      try {
        service.validateId('invalid-uuid');
      } catch (error) {
        expect(error).toBeInstanceOf(CustomHttpException);
        expect(error.getResponse().message).toBe('Invalid plan id format');
      }
    });
  });
});
