import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

export const SqueezeDocs = {
  tag: ApiTags('Squeeze'),

  create: [
    ApiOperation({ summary: 'Register for squeeze' }),
    ApiResponse({
      status: 201,
      description: 'Successfully registered',
      schema: {
        example: {
          success: true,
          message: 'Squeeze registration successful',
          data: {
            id: 'a7e92c4e-3f21-4a5d-a8ae-57b923f1eac7',
            email: 'user@example.com',
            created_at: '2025-01-01T12:00:00.000Z',
            updated_at: '2025-01-01T12:00:00.000Z',
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Duplicate email',
      schema: {
        example: {
          success: false,
          message: 'Email already registered',
          error: 'Duplicate email in waitlist',
          status_code: 400,
        },
      },
    }),
    ApiResponse({
      status: 422,
      description: 'Validation error',
      schema: {
        example: {
          success: false,
          message: 'Validation failed',
          errors: {
            email: ['Invalid email format'],
          },
          status_code: 422,
        },
      },
    }),
  ],
};
