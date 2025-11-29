import { Controller, Post, Body, Logger } from '@nestjs/common';
import { SqueezeService } from './squeeze.service';
import { SqueezeDto } from './dtos/squeeze.dto';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Public } from '@guards/public.decorator';

@Controller('squeeze')
@Public()
export class SqueezeController {
  private readonly logger = new Logger(SqueezeController.name);

  constructor(private readonly service: SqueezeService) {}

  @Post()
  @ApiBody({
    schema: {
      example: {
        email: 'user@example.com',
        name: 'Umar',
      },
    },
  })
  @ApiOperation({ summary: 'Register for blog' })
  @ApiResponse({
    status: 201,
    description: 'Successfully registered',
    schema: {
      example: {
        success: true,
        message: 'Blog registration successful',
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
  async register(@Body() body: SqueezeDto) {
    this.logger.log(`Blog registration request received for: ${body.email}`);
    try {
      const data = await this.service.register(body);
      return {
        success: true,
        status: 'success',
        message: 'Blog registration successful',
        data,
        status_code: 201,
      };
    } catch (error) {
      this.logger.error(
        `Error in register endpoint: ${(error as Error).message}`,
      );
      this.logger.error(`Stack: ${(error as Error).stack}`);
      throw error;
    }
  }
}
