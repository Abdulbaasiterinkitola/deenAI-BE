import { HttpStatus, Injectable } from '@nestjs/common';
import { ReflectionsActionModel } from '../action-models/reflections.action-model';
import { ReflectionsValidationService } from './reflections-validation.service';
import { Reflection } from '../models/reflection.model';
import {
  CreateReflectionType,
  ReflectionQueryType,
  UpdateReflectionType,
} from '../types/reflection';
import { CustomHttpException } from '@shared/custom.exception';
import { PaginationMeta } from '@shared/helpers/pagination.helper';

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

  async createReflection(
    dto: CreateReflectionType,
    userId: string,
  ): Promise<Reflection> {
    this.reflectionsValidationService.validateReflectionContent(dto.content);

    const reflectionCount = await this.reflectionsActionModel.count({ userId });
    if (reflectionCount >= 10) {
      throw new CustomHttpException(
        'Free plan limit reached. You can only create 10 reflections.',
        HttpStatus.FORBIDDEN,
      );
    }

    const reflection = await this.reflectionsActionModel.create({
      createPayload: {
        userId,
        ...dto,
      },
    });

    if (!reflection) {
      throw new CustomHttpException(
        'Failed to create reflection',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return reflection;
  }

  // /**
  //  * Retrieves a reflection by its ID, ensuring it belongs to the specified user
  //  * @param id - The ID of the reflection to retrieve
  //  * @param userId - The ID of the user requesting the reflection
  //  * @returns The reflection if found and belongs to the user
  //  */
  async getReflectionById(id: string, userId: string): Promise<Reflection> {
    this.reflectionsValidationService.validateReflectionId(id);

    const reflection = await this.reflectionsActionModel.get({ id, userId });

    this.reflectionsValidationService.validateReflectionOwnership(
      reflection,
      userId,
    );

    return reflection;
  }

  // /**
  //  * Updates a reflection, ensuring it belongs to the specified user
  //  * @param id - The ID of the reflection to update
  //  * @param updatePayload - The data to update
  //  * @param userId - The ID of the user updating the reflection
  //  * @returns The updated reflection
  //  */
  async updateReflection(
    id: string,
    updatePayload: UpdateReflectionType,
    userId: string,
  ): Promise<Reflection> {
    this.reflectionsValidationService.validateReflectionId(id);

    if (updatePayload.content) {
      this.reflectionsValidationService.validateReflectionContent(
        updatePayload.content,
      );
    }

    const existingReflection = await this.reflectionsActionModel.get({
      id,
      userId,
    });
    this.reflectionsValidationService.validateReflectionOwnership(
      existingReflection,
      userId,
    );

    const updatedReflection = await this.reflectionsActionModel.update({
      updatePayload,
      identifierOptions: { id, userId },
    });

    if (!updatedReflection) {
      throw new CustomHttpException(
        'Failed to update reflection',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return updatedReflection;
  }

  // /**
  //  * Deletes a reflection, ensuring it belongs to the specified user
  //  * @param id - The ID of the reflection to delete
  //  * @param userId - The ID of the user deleting the reflection
  //  */
  async deleteReflection(id: string, userId: string): Promise<void> {
    this.reflectionsValidationService.validateReflectionId(id);

    const existingReflection = await this.reflectionsActionModel.get({
      id,
      userId,
    });
    this.reflectionsValidationService.validateReflectionOwnership(
      existingReflection,
      userId,
    );

    await this.reflectionsActionModel.delete({
      identifierOptions: { id, userId },
    });
  }

  // /**
  //  * Retrieves all reflections for a specific user with pagination
  //  * @param userId - The ID of the user
  //  * @param query - Pagination and sorting options
  //  * @returns Paginated list of reflections
  //  */
  async getUserReflections(
    userId: string,
    query: ReflectionQueryType,
  ): Promise<{
    payload: Reflection[];
    paginationMeta: Partial<PaginationMeta>;
  }> {
    this.reflectionsValidationService.validatePaginationParams(
      query.page,
      query.limit,
    );

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const orderBy = query.orderBy ?? 'DESC';

    return await this.reflectionsActionModel.list({
      filterRecordOptions: {
        userId,
      },
      paginationPayload: {
        page,
        limit,
      },
      order: {
        createdAt: orderBy,
      },
    });
  }
}
