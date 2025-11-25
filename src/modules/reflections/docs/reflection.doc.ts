import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

/**
 * Documentation for the DELETE /api/v1/reflections/:id endpoint
 */
export const DeleteReflectionDoc = {
  operation: () => [
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
  create: () =>
    applyDecorators(
      ApiBearerAuth(),
      ApiOperation({
        summary: 'Create a new reflection',
        description: 'Creates a new reflection for the authenticated user.',
      }),
      ApiBody({
        description: 'Reflection creation data',
        schema: {
          oneOf: [
            {
              type: 'object',
              required: ['type', 'surah', 'startAyah', 'endAyah', 'content'],
              properties: {
                type: { type: 'string', enum: ['quran'] },
                surah: { type: 'integer', minimum: 1 },
                startAyah: { type: 'integer', minimum: 1 },
                endAyah: { type: 'integer', minimum: 1 },
                content: { type: 'string', minLength: 1, maxLength: 5000 },
              },
              description: 'Payload structure for Quran based reflections',
            },
            {
              type: 'object',
              required: ['type', 'collectionId', 'hadithNumber', 'bookNumber', 'content'],
              properties: {
                type: { type: 'string', enum: ['hadith'] },
                collectionId: { type: 'string' },
                hadithNumber: { type: 'integer', minimum: 1 },
                bookNumber: { type: 'integer', minimum: 1 },
                content: { type: 'string', minLength: 1, maxLength: 5000 },
              },
              description: 'Payload structure for Hadith based reflections',
            },
          ],
        },
        examples: {
          quranExample: {
            summary: 'Quran Reflection Example',
            description: 'Example of creating a reflection for a Quran verse',
            value: {
              type: 'quran',
              surah: 32,
              startAyah: 1,
              endAyah: 5,
              content:
                'Today I learned about the importance of patience in software development.',
            },
          },
          hadithExample: {
            summary: 'Hadith Reflection Example',
            description: 'Example of creating a reflection for a Hadith',
            value: {
              type: 'hadith',
              collectionId: 'bukhari',
              hadithNumber: 1234,
              bookNumber: 5,
              content:
                'Today I reflected on this hadith and learned about sincerity in actions.',
            },
          },
        },
      }),
      ApiResponse({
        status: 201,
        description: 'Reflection successfully created',
        content: {
          'application/json': {
            schema: {
              oneOf: [
                {
                  title: 'Quran Reflection Response',
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Reflection created successfully',
                    },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        content: { type: 'string' },
                        type: { type: 'string', enum: ['quran'] },
                        surah: { type: 'integer' },
                        startAyah: { type: 'integer' },
                        endAyah: { type: 'integer' },
                        userId: { type: 'string', format: 'uuid' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                  example: {
                    success: true,
                    message: 'Reflection created successfully',
                    data: {
                      id: 'a7e92c4e-3f21-4a5d-a8ae-57b923f1eac7',
                      content:
                        'Today I learned about the importance of patience in software development.',
                      type: 'quran',
                      surah: 32,
                      startAyah: 1,
                      endAyah: 5,
                      userId: 'b8f03d5f-4g32-5b6e-b9bf-68c034g2fbd8',
                      createdAt: '2025-01-01T12:00:00.000Z',
                      updatedAt: '2025-01-01T12:00:00.000Z',
                    },
                  },
                },
                {
                  title: 'Hadith Reflection Response',
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Reflection created successfully',
                    },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        content: { type: 'string' },
                        type: { type: 'string', enum: ['hadith'] },
                        collectionId: { type: 'string' },
                        hadithNumber: { type: 'integer' },
                        bookNumber: { type: 'integer' },
                        userId: { type: 'string', format: 'uuid' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                  example: {
                    success: true,
                    message: 'Reflection created successfully',
                    data: {
                      id: 'b8f03d5f-4g32-5b6e-b9bf-68c034g2fbd8',
                      content:
                        'Today I reflected on this hadith and learned about sincerity in actions.',
                      type: 'hadith',
                      collectionId: 'bukhari',
                      hadithNumber: 1234,
                      bookNumber: 5,
                      userId: 'b8f03d5f-4g32-5b6e-b9bf-68c034g2fbd8',
                      createdAt: '2025-01-01T12:00:00.000Z',
                      updatedAt: '2025-01-01T12:00:00.000Z',
                    },
                  },
                },
              ],
            },
          },
        },
      }),
      ApiResponse({
        status: 400,
        description: 'Validation error',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string' },
                errors: {
                  type: 'object',
                  additionalProperties: { type: 'array', items: { type: 'string' } },
                },
                status_code: { type: 'integer', example: 400 },
              },
              example: {
                success: false,
                message: 'Validation failed',
                errors: {
                  content: ['Reflection content cannot be empty'],
                },
                status_code: 400,
              },
            },
          },
        },
      }),
    ),
};

/**
 * Documentation for the GET /api/v1/reflections endpoint
 */
export const GetUserReflectionsDoc = {
  operation: () => [
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
                id: 'f4bfcc11-1cb4-4e41-b78f-c8f817b7a90f',
                content:
                  'Today I learned about the importance of patience in software development.',
                type: 'quran',
                surah: 32,
                startAyah: 1,
                endAyah: 5,
                userId: 'b8f03d5f-4g32-5b6e-b9bf-68c034g2fbd8',
                createdAt: '2025-01-01T12:00:00.000Z',
                updatedAt: '2025-01-01T12:00:00.000Z',
              },
              {
                id: 'a7e92c4e-3f21-4a5d-a8ae-57b923f1eac7',
                content:
                  'Today I reflected on this hadith and learned about sincerity.',
                type: 'hadith',
                collectionId: 'bukhari',
                hadithNumber: 1234,
                bookNumber: 5,
                userId: 'b8f03d5f-4g32-5b6e-b9bf-68c034g2fbd8',
                createdAt: '2025-01-02T12:00:00.000Z',
                updatedAt: '2025-01-02T12:00:00.000Z',
              },
            ],
            paginationMeta: {
              total: 2,
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
  operation: () => [
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
            type: 'quran',
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
  operation: () => [
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
            type: 'hadith',
            collectionId: 'bukhari',
            hadithNumber: 1234,
            bookNumber: 5,
            userId: 'b8f03d5f-4g32-5b6e-b9bf-68c034g2fbd8',
            createdAt: '2025-01-01T12:00:00.000Z',
            updatedAt: '2025-01-01T13:00:00.000Z',
          },
        },
      },
    }),
};
