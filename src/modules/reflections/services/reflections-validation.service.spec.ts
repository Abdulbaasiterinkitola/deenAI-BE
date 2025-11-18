import { Test, TestingModule } from '@nestjs/testing';
import { ReflectionsValidationService } from './reflections-validation.service';
import { Reflection } from '../models/reflection.model';
import { User } from '@modules/users/models/user.model';
import { AuthProvider } from '@modules/users/enums';
import { CustomHttpException } from '@shared/custom.exception';
import { HttpStatus } from '@nestjs/common';

describe('ReflectionsValidationService', () => {
  let service: ReflectionsValidationService;

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
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReflectionsValidationService],
    }).compile();

    service = module.get<ReflectionsValidationService>(ReflectionsValidationService);
  });

  describe('validateReflectionContent', () => {
    it('should pass validation with valid content', () => {
      // Arrange
      const validContent = 'This is a valid reflection content';

      // Act & Assert
      expect(() => service.validateReflectionContent(validContent)).not.toThrow();
    });

    it('should throw an error when content is null', () => {
      // Arrange
      const invalidContent = null;

      // Act & Assert
      expect(() => service.validateReflectionContent(invalidContent as any)).toThrow(
        new CustomHttpException('Reflection content is required', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw an error when content is undefined', () => {
      // Arrange
      const invalidContent = undefined;

      // Act & Assert
      expect(() => service.validateReflectionContent(invalidContent as any)).toThrow(
        new CustomHttpException('Reflection content is required', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw an error when content is not a string', () => {
      // Arrange
      const invalidContent = 123;

      // Act & Assert
      expect(() => service.validateReflectionContent(invalidContent as any)).toThrow(
        new CustomHttpException('Reflection content must be a string', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw an error when content is empty string', () => {
      // Arrange
      const invalidContent = '';

      // Act & Assert
      expect(() => service.validateReflectionContent(invalidContent)).toThrow(
        new CustomHttpException('Reflection content cannot be empty', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw an error when content is only whitespace', () => {
      // Arrange
      const invalidContent = '   ';

      // Act & Assert
      expect(() => service.validateReflectionContent(invalidContent)).toThrow(
        new CustomHttpException('Reflection content cannot be empty', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw an error when content exceeds maximum length', () => {
      // Arrange
      const invalidContent = 'a'.repeat(10001);

      // Act & Assert
      expect(() => service.validateReflectionContent(invalidContent)).toThrow(
        new CustomHttpException(
          'Reflection content cannot exceed 10,000 characters',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });

  describe('validateReflectionOwnership', () => {
    it('should pass validation when reflection belongs to user', () => {
      // Arrange
      const userId = 'test-user-id';

      // Act & Assert
      expect(() => service.validateReflectionOwnership(mockReflection, userId)).not.toThrow();
    });

    it('should throw an error when reflection is null', () => {
      // Arrange
      const userId = 'test-user-id';
      const reflection = null;

      // Act & Assert
      expect(() => service.validateReflectionOwnership(reflection, userId)).toThrow(
        new CustomHttpException('Reflection not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw an error when reflection does not belong to user', () => {
      // Arrange
      const userId = 'different-user-id';

      // Act & Assert
      expect(() => service.validateReflectionOwnership(mockReflection, userId)).toThrow(
        new CustomHttpException(
          'You do not have permission to access this reflection',
          HttpStatus.FORBIDDEN,
        ),
      );
    });
  });

  describe('validateReflectionId', () => {
    it('should pass validation with valid UUID', () => {
      // Arrange
      const validId = 'a7e92c4e-3f21-4a5d-a8ae-57b923f1eac7';

      // Act & Assert
      expect(() => service.validateReflectionId(validId)).not.toThrow();
    });

    it('should throw an error when ID is null', () => {
      // Arrange
      const invalidId = null;

      // Act & Assert
      expect(() => service.validateReflectionId(invalidId as any)).toThrow(
        new CustomHttpException('Reflection ID is required', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw an error when ID is undefined', () => {
      // Arrange
      const invalidId = undefined;

      // Act & Assert
      expect(() => service.validateReflectionId(invalidId as any)).toThrow(
        new CustomHttpException('Reflection ID is required', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw an error when ID is not a string', () => {
      // Arrange
      const invalidId = 123;

      // Act & Assert
      expect(() => service.validateReflectionId(invalidId as any)).toThrow(
        new CustomHttpException('Reflection ID must be a string', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw an error when ID is not a valid UUID', () => {
      // Arrange
      const invalidId = 'invalid-uuid-format';

      // Act & Assert
      expect(() => service.validateReflectionId(invalidId)).toThrow(
        new CustomHttpException('Invalid reflection ID format', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw an error when ID is an empty string', () => {
      // Arrange
      const invalidId = '';

      // Act & Assert
      expect(() => service.validateReflectionId(invalidId)).toThrow(
        new CustomHttpException('Reflection ID is required', HttpStatus.BAD_REQUEST),
      );
    });
  });

  describe('validatePaginationParams', () => {
    it('should pass validation with valid pagination parameters', () => {
      // Arrange
      const validPage = 1;
      const validLimit = 10;

      // Act & Assert
      expect(() => service.validatePaginationParams(validPage, validLimit)).not.toThrow();
    });

    it('should pass validation with undefined pagination parameters', () => {
      // Arrange
      const undefinedPage = undefined;
      const undefinedLimit = undefined;

      // Act & Assert
      expect(() => service.validatePaginationParams(undefinedPage, undefinedLimit)).not.toThrow();
    });

    it('should throw an error when page is not a positive integer', () => {
      // Arrange
      const invalidPage = 0;

      // Act & Assert
      expect(() => service.validatePaginationParams(invalidPage)).toThrow(
        new CustomHttpException('Page must be a positive integer', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw an error when page is negative', () => {
      // Arrange
      const invalidPage = -1;

      // Act & Assert
      expect(() => service.validatePaginationParams(invalidPage)).toThrow(
        new CustomHttpException('Page must be a positive integer', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw an error when page is not an integer', () => {
      // Arrange
      const invalidPage = 1.5;

      // Act & Assert
      expect(() => service.validatePaginationParams(invalidPage)).toThrow(
        new CustomHttpException('Page must be a positive integer', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw an error when limit is less than 1', () => {
      // Arrange
      const invalidLimit = 0;

      // Act & Assert
      expect(() => service.validatePaginationParams(undefined, invalidLimit)).toThrow(
        new CustomHttpException('Limit must be between 1 and 100', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw an error when limit is greater than 100', () => {
      // Arrange
      const invalidLimit = 101;

      // Act & Assert
      expect(() => service.validatePaginationParams(undefined, invalidLimit)).toThrow(
        new CustomHttpException('Limit must be between 1 and 100', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw an error when limit is not an integer', () => {
      // Arrange
      const invalidLimit = 10.5;

      // Act & Assert
      expect(() => service.validatePaginationParams(undefined, invalidLimit)).toThrow(
        new CustomHttpException('Limit must be between 1 and 100', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw an error when limit is negative', () => {
      // Arrange
      const invalidLimit = -1;

      // Act & Assert
      expect(() => service.validatePaginationParams(undefined, invalidLimit)).toThrow(
        new CustomHttpException('Limit must be between 1 and 100', HttpStatus.BAD_REQUEST),
      );
    });
  });
});