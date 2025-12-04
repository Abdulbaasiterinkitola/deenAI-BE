import {
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';

export class SuperadminDocs {
  static listUsers() {
    return applyDecorators(
      ApiBearerAuth(),
      ApiOperation({
        summary: 'List all users',
        description:
          'Retrieves a paginated and filterable list of users. Only accessible by superadmins.',
      }),
      ApiQuery({
        name: 'search',
        required: false,
        description: 'Text search across name, email, and other fields',
        type: String,
      }),
      ApiQuery({
        name: 'page',
        required: false,
        description: 'Page number (optional, default is 1)',
        type: Number,
      }),
      ApiQuery({
        name: 'limit',
        required: false,
        description:
          'Number of users per page (optional, default is 10, max 100)',
        type: Number,
      }),

      ApiQuery({
        name: 'status',
        required: false,
        description: 'Filter users by status (active/paused)',
        type: String,
      }),
      ApiQuery({
        name: 'role',
        required: false,
        description: 'Filter users by role (user/admin/superadmin)',
        type: String,
      }),
      ApiResponse({
        status: 200,
        description: 'Users retrieved successfully.',
        schema: {
          example: {
            success: true,
            message: 'Users retrieved successfully',
            status_code: 200,
            data: {
              users: [],
              pagination: {
                page: 1,
                limit: 20,
                total: 0,
              },
            },
          },
        },
      }),
    );
  }

  static getUserById() {
    return applyDecorators(
      ApiBearerAuth(),
      ApiOperation({
        summary: 'Get user by ID',
        description:
          'Fetches a single user by ID. Only accessible by superadmins.',
      }),
      ApiParam({
        name: 'id',
        description: 'ID of the user to retrieve',
      }),
      ApiResponse({
        status: 200,
        description: 'User retrieved successfully.',
        schema: {
          example: {
            success: true,
            message: 'User retrieved successfully',
            status_code: 200,
            data: {
              user: {},
            },
          },
        },
      }),
      ApiResponse({
        status: 404,
        description: 'User not found.',
        schema: {
          example: {
            success: false,
            message: 'User with ID <id> not found',
            status_code: 404,
          },
        },
      }),
    );
  }

  static createUser() {
    return applyDecorators(
      ApiBearerAuth(),
      ApiOperation({
        summary: 'Create a new user',
        description:
          'Creates a new user with the provided data. Only accessible by superadmins.',
      }),
      ApiBody({
        type: CreateUserDto,
        description: 'User creation payload',
      }),
      ApiResponse({
        status: 201,
        description: 'User created successfully.',
        schema: {
          example: {
            success: true,
            message: 'User created successfully',
            status_code: 201,
            data: {
              user: {},
            },
          },
        },
      }),
      ApiResponse({
        status: 409,
        description: 'Conflict — Email already exists.',
        schema: {
          example: {
            success: false,
            message: 'User with email already exists',
            status_code: 409,
          },
        },
      }),
    );
  }

  static updateUser() {
    return applyDecorators(
      ApiBearerAuth(),
      ApiOperation({
        summary: 'Update user',
        description:
          'Updates the details of an existing user. Only accessible by superadmins.',
      }),
      ApiParam({
        name: 'id',
        description: 'ID of the user to update',
      }),
      ApiBody({
        type: UpdateUserDto,
        description: 'Fields to update on the user',
      }),
      ApiResponse({
        status: 200,
        description: 'User updated successfully.',
        schema: {
          example: {
            success: true,
            message: 'User updated successfully',
            status_code: 200,
            data: {
              user: {},
            },
          },
        },
      }),
      ApiResponse({
        status: 400,
        description: 'Cannot update own account.',
      }),
      ApiResponse({
        status: 409,
        description: 'Email conflict.',
      }),
      ApiResponse({
        status: 404,
        description: 'User not found.',
      }),
    );
  }

  static deleteUser() {
    return applyDecorators(
      ApiBearerAuth(),
      ApiOperation({
        summary: 'Delete user',
        description:
          'Permanently deletes a user. Only accessible by superadmins.',
      }),
      ApiParam({
        name: 'id',
        description: 'ID of the user to delete',
      }),
      ApiResponse({
        status: 200,
        description: 'User deleted successfully.',
        schema: {
          example: {
            success: true,
            message: 'User deleted successfully',
            status_code: 200,
          },
        },
      }),
      ApiResponse({
        status: 400,
        description: 'Cannot delete own account.',
      }),
      ApiResponse({
        status: 404,
        description: 'User not found.',
      }),
    );
  }

  static activateUser() {
    return applyDecorators(
      ApiBearerAuth(),
      ApiOperation({
        summary: 'Activate user',
        description: 'Activates a user account.',
      }),
      ApiParam({
        name: 'id',
        description: 'User ID to activate',
      }),
      ApiResponse({
        status: 200,
        description: 'User activated successfully.',
      }),
      ApiResponse({
        status: 400,
        description: 'User is already active or cannot self-activate.',
      }),
      ApiResponse({
        status: 404,
        description: 'User not found.',
      }),
    );
  }

  static deactivateUser() {
    return applyDecorators(
      ApiBearerAuth(),
      ApiOperation({
        summary: 'Deactivate user',
        description: 'Pauses a user account.',
      }),
      ApiParam({
        name: 'id',
        description: 'User ID to deactivate',
      }),
      ApiResponse({
        status: 200,
        description: 'User deactivated successfully.',
      }),
      ApiResponse({
        status: 400,
        description: 'User is already paused or cannot self-deactivate.',
      }),
      ApiResponse({
        status: 404,
        description: 'User not found.',
      }),
    );
  }

  static resetUserPassword() {
    return applyDecorators(
      ApiBearerAuth(),
      ApiOperation({
        summary: 'Reset user password',
        description:
          'Generates a new password for the user and emails it to them.',
      }),
      ApiParam({
        name: 'id',
        description: 'User ID to reset password for',
      }),
      ApiResponse({
        status: 200,
        description: 'Password reset successfully.',
      }),
      ApiResponse({
        status: 400,
        description: 'Cannot reset password for own account.',
      }),
      ApiResponse({
        status: 404,
        description: 'User not found.',
      }),
    );
  }

  static promoteToSuperadmin() {
    return applyDecorators(
      ApiBearerAuth(),
      ApiOperation({
        summary: 'Promote user to superadmin',
        description: 'Elevates a user to superadmin role.',
      }),
      ApiParam({
        name: 'id',
        description: 'User ID to promote',
      }),
      ApiResponse({
        status: 200,
        description: 'User promoted to superadmin successfully.',
      }),
      ApiResponse({
        status: 400,
        description: 'User is already superadmin or cannot self-promote.',
      }),
      ApiResponse({
        status: 404,
        description: 'User not found.',
      }),
    );
  }

  static demoteFromSuperadmin() {
    return applyDecorators(
      ApiBearerAuth(),
      ApiOperation({
        summary: 'Demote superadmin',
        description: 'Removes superadmin privileges from a user.',
      }),
      ApiParam({
        name: 'id',
        description: 'User ID to demote',
      }),
      ApiResponse({
        status: 200,
        description: 'User demoted successfully.',
      }),
      ApiResponse({
        status: 400,
        description: 'User is not a superadmin or cannot self-demote.',
      }),
      ApiResponse({
        status: 404,
        description: 'User not found.',
      }),
    );
  }
}
