import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  Type,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ReflectionsService } from './reflections.service';
import {
  CreateReflectionDto,
  UpdateReflectionDto,
  ReflectionQueryDto,
  ReflectionIdDto,
  PaginatedReflectionsResponseDto,
} from './dtos/reflection.dto';
import { AuthGuard } from '@guards/auth.guard';
import { DocsResponseDto } from '@shared/docs-response.dto';

@ApiTags('reflections')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('reflections')
export class ReflectionsController {
  constructor(private readonly reflectionsService: ReflectionsService) {}

  /**
   * DELETE endpoint to delete a reflection by ID
   * Requires authentication and ownership validation
   */
  @Delete(':id')
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the reflection to delete',
    example: 'a7e92c4e-3f21-4a5d-a8ae-57b923f1eac7',
  })
  @ApiOperation({
    summary: 'Delete a reflection',
    description:
      'Deletes a reflection by its ID. Only the owner of the reflection can delete it.',
  })
  @ApiResponse({
    status: 200,
    description: 'Reflection successfully deleted',
    schema: {
      example: {
        success: true,
        message: 'Reflection deleted successfully',
      },
    },
  })
  @ApiResponse({
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
  })
  @ApiResponse({
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
  })
  @ApiResponse({
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
  })
  async deleteReflection(
    @Param() params: ReflectionIdDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id as string;
    await this.reflectionsService.deleteReflection(params.id, userId);

    return { message: 'Reflection deleted successfully' };
  }

  /**
   * POST endpoint to create a new reflection
   * Requires authentication
   */
  @Post()
  @ApiOperation({
    summary: 'Create a new reflection',
    description: 'Creates a new reflection for the authenticated user.',
  })
  @ApiResponse({
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
          userId: 'b8f03d5f-4g32-5b6e-b9bf-68c034g2fbd8',
          createdAt: '2025-01-01T12:00:00.000Z',
          updatedAt: '2025-01-01T12:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
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
  })
  async createReflection(
    @Body() createReflectionDto: CreateReflectionDto,
    @Request() req: any,
  ): Promise<any> {
    const userId = req.user?.id as string;
    const reflection = await this.reflectionsService.createReflection(
      createReflectionDto,
      userId,
    );

    return reflection;
  }

  /**
   * GET endpoint to retrieve all reflections for the authenticated user
   * Requires authentication
   */
  @Get()
  @ApiOperation({
    summary: 'Get user reflections',
    description:
      'Retrieves all reflections for the authenticated user with pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'Reflections retrieved successfully',
    type: DocsResponseDto<PaginatedReflectionsResponseDto>(
      PaginatedReflectionsResponseDto as Type<PaginatedReflectionsResponseDto>,
    ),
  })
  async getUserReflections(
    @Query() query: ReflectionQueryDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id as string;
    const result = await this.reflectionsService.getUserReflections(
      userId,
      query,
    );

    return result;
  }

  /**
   * GET endpoint to retrieve a specific reflection by ID
   * Requires authentication and ownership validation
   */
  @Get(':id')
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the reflection to retrieve',
    example: 'a7e92c4e-3f21-4a5d-a8ae-57b923f1eac7',
  })
  @ApiOperation({
    summary: 'Get a reflection by ID',
    description:
      'Retrieves a specific reflection by its ID. Only the owner of the reflection can access it.',
  })
  @ApiResponse({
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
          userId: 'b8f03d5f-4g32-5b6e-b9bf-68c034g2fbd8',
          createdAt: '2025-01-01T12:00:00.000Z',
          updatedAt: '2025-01-01T12:00:00.000Z',
        },
      },
    },
  })
  async getReflectionById(
    @Param() params: ReflectionIdDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id as string;
    const reflection = await this.reflectionsService.getReflectionById(
      params.id,
      userId,
    );

    return reflection;
  }

  /**
   * PUT endpoint to update a reflection by ID
   * Requires authentication and ownership validation
   */
  @Put(':id')
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the reflection to update',
    example: 'a7e92c4e-3f21-4a5d-a8ae-57b923f1eac7',
  })
  @ApiOperation({
    summary: 'Update a reflection',
    description:
      'Updates a reflection by its ID. Only the owner of the reflection can update it.',
  })
  @ApiResponse({
    status: 200,
    description: 'Reflection successfully updated',
    schema: {
      example: {
        success: true,
        message: 'Reflection updated successfully',
        data: {
          id: 'a7e92c4e-3f21-4a5d-a8ae-57b923f1eac7',
          content: 'Updated reflection content with new insights.',
          userId: 'b8f03d5f-4g32-5b6e-b9bf-68c034g2fbd8',
          createdAt: '2025-01-01T12:00:00.000Z',
          updatedAt: '2025-01-01T13:00:00.000Z',
        },
      },
    },
  })
  async updateReflection(
    @Param() params: ReflectionIdDto,
    @Body() updateReflectionDto: UpdateReflectionDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id as string;
    const reflection = await this.reflectionsService.updateReflection(
      params.id,
      updateReflectionDto,
      userId,
    );

    return reflection;
  }
}
