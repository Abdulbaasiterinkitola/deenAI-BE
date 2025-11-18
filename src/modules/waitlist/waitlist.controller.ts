import { Controller, Post, Body } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { WaitlistDto } from './dtos/waitlist.dto';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly service: WaitlistService) {}

  @Post()
  @ApiBody({
    schema: {
      example: {
        email: 'user@example.com',
        name: 'Umar',
      },
    },
  })
  @ApiOperation({ summary: 'Register for waitlist' })
  @ApiResponse({
    status: 201,
    description: 'Successfully registered',
    schema: {
      example: {
        success: true,
        message: 'Waitlist registration successful',
        data: {
          id: 'a7e92c4e-3f21-4a5d-a8ae-57b923f1eac7',
          email: 'user@example.com',
          created_at: '2025-01-01T12:00:00.000Z',
          updated_at: '2025-01-01T12:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
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
  })
  @ApiResponse({
    status: 422,
    description: 'Validation error',
    schema: {
      example: {
        success: false,
        message: 'Validation failed',
        errors: { email: ['Invalid email format'] },
        status_code: 422,
      },
    },
  })
  async register(@Body() body: WaitlistDto) {
    const data = await this.service.register(body);
    return {
      success: true,
      message: 'Waitlist registration successful',
      data,
    };
  }
}
