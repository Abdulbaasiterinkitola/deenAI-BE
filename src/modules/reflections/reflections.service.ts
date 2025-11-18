import { Injectable } from '@nestjs/common';
import { ReflectionsCoreService } from './services/reflections-core.service';
import { CreateReflectionType, UpdateReflectionType, ReflectionQueryType } from './types/reflection';
import { Reflection } from './models/reflection.model';

/**
 * Service for handling reflection operations
 * Acts as a facade for the core service and handles business logic
 */
@Injectable()
export class ReflectionsService {
  constructor(private readonly reflectionsCoreService: ReflectionsCoreService) {}

  /**
   * Creates a new reflection for a user
   * @param createPayload - The reflection data to create
   * @param userId - The ID of the user creating the reflection
   * @returns The created reflection
   */
  async createReflection(createPayload: CreateReflectionType, userId: string): Promise<Reflection> {
    return await this.reflectionsCoreService.createReflection(createPayload, userId);
  }

  /**
   * Retrieves a reflection by its ID, ensuring it belongs to the specified user
   * @param id - The ID of the reflection to retrieve
   * @param userId - The ID of the user requesting the reflection
   * @returns The reflection if found and belongs to the user
   */
  async getReflectionById(id: string, userId: string): Promise<Reflection> {
    return await this.reflectionsCoreService.getReflectionById(id, userId);
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
    return await this.reflectionsCoreService.updateReflection(id, updatePayload, userId);
  }

  /**
   * Deletes a reflection, ensuring it belongs to the specified user
   * @param id - The ID of the reflection to delete
   * @param userId - The ID of the user deleting the reflection
   */
  async deleteReflection(id: string, userId: string): Promise<void> {
    return await this.reflectionsCoreService.deleteReflection(id, userId);
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
    return await this.reflectionsCoreService.getUserReflections(userId, query);
  }
}