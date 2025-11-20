import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

/**
 * Documentation for the DELETE /api/v1/reflections/:id endpoint
 */
export const DeleteReflectionDoc = {
  operation: () =>
    [
      ApiBearerAuth(),
      ApiOperation({
        summary: 'Delete a reflection',
        description:
          'Deletes a reflection by its ID. Only the owner of the reflection can delete it.',
      }),
    ],

  param: () =>
    ApiParam({
      name: 'id',
      description: 'The unique identifier of the reflection to delete',
      example: 'a7e92c4e-3f21-4a5d-a8ae-57b923f1eac7',
    }),

  successResponse: () =>
    ApiResponse({
      status: 200,
      description: 'Reflection successfully deleted',
      schema: {
        example: {
          success: true,
          message: 'Reflection deleted successfully',
        },
      },
    }),

  notFoundResponse: () =>
    ApiResponse({
      status: 404,
      description: 'Reflection not found',
      schema: {
        example: {
          success: false,
          message: 'Reflection not found',
          error: 'Reflection with the specified ID does not exist',
          status_code: 404,
        },
      },
    }),

  forbiddenResponse: () =>
    ApiResponse({
      status: 403,
      description: 'Access denied - reflection belongs to another user',
      schema: {
        example: {
          success: false,
          message: 'You do not have permission to access this reflection',
          error: 'Reflection ownership validation failed',
          status_code: 403,
        },
      },
    }),

  unauthorizedResponse: () =>
    ApiResponse({
      status: 401,
      description: 'Authentication required',
      schema: {
        example: {
          success: false,
          message: 'Authentication required',
          error: 'No authentication token provided',
          status_code: 401,
        },
      },
    }),
};

/**
 * Documentation for the POST /api/v1/reflections endpoint
 */
export const CreateReflectionDoc = {
  operation: () =>
    [
      ApiBearerAuth(),
      ApiOperation({
        summary: 'Create a new reflection',
        description: 'Creates a new reflection for the authenticated user.',
      }),
    ],

  successResponse: () =>
    ApiResponse({
      status: 201,
      description: 'Reflection successfully created',
      schema: {
        example: {
          success: true,
          message: 'Reflection created successfully',
          data: {
            id: 'a7e92c4e-3f21-4a5d-a8ae-57b923f1eac7',
            content:
              'Today I learned about the importance of patience in software development.',
            surah: 32,
            startAyah: 1,
            endAyah: 5,
            userId: 'b8f03d5f-4g32-5b6e-b9bf-68c034g2fbd8',
            createdAt: '2025-01-01T12:00:00.000Z',
            updatedAt: '2025-01-01T12:00:00.000Z',
          },
        },
      },
    }),

  validationErrorResponse: () =>
    ApiResponse({
      status: 400,
      description: 'Validation error',
      schema: {
        example: {
          success: false,
          message: 'Validation failed',
          errors: {
            content: ['Reflection content cannot be empty'],
          },
          status_code: 400,
        },
      },
    }),
};

/**
 * Documentation for the GET /api/v1/reflections endpoint
 */
export const GetUserReflectionsDoc = {
  operation: () =>
    [
      ApiBearerAuth(),
      ApiOperation({
        summary: 'Get user reflections',
        description:
          'Retrieves all reflections for the authenticated user with pagination.',
      }),
    ],

  successResponse: () =>
    ApiResponse({
      status: 200,
      description: 'Reflections retrieved successfully',
      schema: {
        example: {
          success: true,
          message: 'Reflections retrieved successfully',
          data: {
            payload: [
              {
                id: 'a7e92c4e-3f21-4a5d-a8ae-57b923f1eac7',
                content:
                  'Today I learned about the importance of patience in software development.',
                surah: 32,
                startAyah: 1,
                endAyah: 5,
                userId: 'b8f03d5f-4g32-5b6e-b9bf-68c034g2fbd8',
                createdAt: '2025-01-01T12:00:00.000Z',
                updatedAt: '2025-01-01T12:00:00.000Z',
              },
            ],
            paginationMeta: {
              total: 1,
              limit: 10,
              page: 1,
              totalPages: 1,
              hasNext: false,
              hasPrevious: false,
            },
          },
        },
      },
    }),
};

/**
 * Documentation for the GET /api/v1/reflections/:id endpoint
 */
export const GetReflectionByIdDoc = {
  operation: () =>
    [
      ApiBearerAuth(),
      ApiOperation({
        summary: 'Get a reflection by ID',
        description:
          'Retrieves a specific reflection by its ID. Only the owner of the reflection can access it.',
      }),
    ],

  param: () =>
    ApiParam({
      name: 'id',
      description: 'The unique identifier of the reflection to retrieve',
      example: 'a7e92c4e-3f21-4a5d-a8ae-57b923f1eac7',
    }),

  successResponse: () =>
    ApiResponse({
      status: 200,
      description: 'Reflection retrieved successfully',
      schema: {
        example: {
          success: true,
          message: 'Reflection retrieved successfully',
          data: {
            id: 'a7e92c4e-3f21-4a5d-a8ae-57b923f1eac7',
            content:
              'Today I learned about the importance of patience in software development.',
            surah: 32,
            startAyah: 1,
            endAyah: 5,
            userId: 'b8f03d5f-4g32-5b6e-b9bf-68c034g2fbd8',
            createdAt: '2025-01-01T12:00:00.000Z',
            updatedAt: '2025-01-01T12:00:00.000Z',
          },
        },
      },
    }),
};

/**
 * Documentation for the PUT /api/v1/reflections/:id endpoint
 */
export const UpdateReflectionDoc = {
  operation: () =>
    [
      ApiBearerAuth(),
      ApiOperation({
        summary: 'Update a reflection',
        description:
          'Updates a reflection by its ID. Only the owner of the reflection can update it.',
      }),
    ],

  param: () =>
    ApiParam({
      name: 'id',
      description: 'The unique identifier of the reflection to update',
      example: 'a7e92c4e-3f21-4a5d-a8ae-57b923f1eac7',
    }),

  successResponse: () =>
    ApiResponse({
      status: 200,
      description: 'Reflection successfully updated',
      schema: {
        example: {
          success: true,
          message: 'Reflection updated successfully',
          data: {
            id: 'a7e92c4e-3f21-4a5d-a8ae-57b923f1eac7',
            content: 'Updated reflection content with new insights.',
            surah: 32,
            startAyah: 1,
            endAyah: 5,
            userId: 'b8f03d5f-4g32-5b6e-b9bf-68c034g2fbd8',
            createdAt: '2025-01-01T12:00:00.000Z',
            updatedAt: '2025-01-01T13:00:00.000Z',
          },
        },
      },
    }),
};
