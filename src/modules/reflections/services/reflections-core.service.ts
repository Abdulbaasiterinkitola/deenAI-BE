import { Injectable } from '@nestjs/common';
import { ReflectionsActionModel } from '../action-models/reflections.action-model';
import { CreateReflectionType, UpdateReflectionType, ReflectionQueryType } from '../types/reflection';
import { ReflectionsValidationService } from './reflections-validation.service';
import { Reflection } from '../models/reflection.model';

/**
 * Core service for reflection business logic
 * Handles the main operations for reflections
 */
@Injectable()
export class ReflectionsCoreService {
  constructor(
    private readonly reflectionsActionModel: ReflectionsActionModel,
    private readonly reflectionsValidationService: ReflectionsValidationService,
  ) {}

  /**
   * Creates a new reflection for a user
   * @param createPayload - The reflection data to create
   * @param userId - The ID of the user creating the reflection
   * @returns The created reflection
   */
  async createReflection(createPayload: CreateReflectionType, userId: string): Promise<Reflection> {
    // Validate the reflection content
    this.reflectionsValidationService.validateReflectionContent(createPayload.content);

    // Create the reflection with the user ID
    const reflectionData = {
      ...createPayload,
      userId,
    };

    const reflection = await this.reflectionsActionModel.create({
      createPayload: reflectionData,
    });

    if (!reflection) {
      throw new Error('Failed to create reflection');
    }

    return reflection;
  }

  /**
   * Retrieves a reflection by its ID, ensuring it belongs to the specified user
   * @param id - The ID of the reflection to retrieve
   * @param userId - The ID of the user requesting the reflection
   * @returns The reflection if found and belongs to the user
   */
  async getReflectionById(id: string, userId: string): Promise<Reflection> {
    // Validate the reflection ID format
    this.reflectionsValidationService.validateReflectionId(id);

    // Get the reflection
    const reflection = await this.reflectionsActionModel.findByIdAndUserId(id, userId);

    // Validate that the reflection exists and belongs to the user
    this.reflectionsValidationService.validateReflectionOwnership(reflection, userId);

    return reflection;
  }

  /**
   * Updates a reflection, ensuring it belongs to the specified user
   * @param id - The ID of the reflection to update
   * @param updatePayload - The data to update
   * @param userId - The ID of the user updating the reflection
   * @returns The updated reflection
   */
  async updateReflection(
    id: string,
    updatePayload: UpdateReflectionType,
    userId: string,
  ): Promise<Reflection> {
    // Validate the reflection ID format
    this.reflectionsValidationService.validateReflectionId(id);

    // Validate the content if provided
    if (updatePayload.content) {
      this.reflectionsValidationService.validateReflectionContent(updatePayload.content);
    }

    // Check if the reflection exists and belongs to the user
    const existingReflection = await this.reflectionsActionModel.findByIdAndUserId(id, userId);
    this.reflectionsValidationService.validateReflectionOwnership(existingReflection, userId);

    // Update the reflection
    const updatedReflection = await this.reflectionsActionModel.update({
      updatePayload,
      identifierOptions: { id },
    });

    if (!updatedReflection) {
      throw new Error('Failed to update reflection');
    }

    return updatedReflection;
  }

  /**
   * Deletes a reflection, ensuring it belongs to the specified user
   * @param id - The ID of the reflection to delete
   * @param userId - The ID of the user deleting the reflection
   */
  async deleteReflection(id: string, userId: string): Promise<void> {
    // Validate the reflection ID format
    this.reflectionsValidationService.validateReflectionId(id);

    // Check if the reflection exists and belongs to the user
    const existingReflection = await this.reflectionsActionModel.findByIdAndUserId(id, userId);
    this.reflectionsValidationService.validateReflectionOwnership(existingReflection, userId);

    // Delete the reflection
    await this.reflectionsActionModel.delete({
      identifierOptions: { id },
    });
  }

  /**
   * Retrieves all reflections for a specific user with pagination
   * @param userId - The ID of the user
   * @param query - Pagination and sorting options
   * @returns Paginated list of reflections
   */
  async getUserReflections(
    userId: string,
    query: ReflectionQueryType,
  ): Promise<{ payload: Reflection[]; paginationMeta: any }> {
    // Validate pagination parameters
    this.reflectionsValidationService.validatePaginationParams(query.page, query.limit);

    // Set default values if not provided
    const page = query.page || 1;
    const limit = query.limit || 10;
    const orderBy = query.orderBy || 'DESC';

    return await this.reflectionsActionModel.findByUserId(userId, {
      paginationPayload: { page, limit },
      order: { createdAt: orderBy },
    });
  }
}