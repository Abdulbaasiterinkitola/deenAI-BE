import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthDocs } from './docs/health.docs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  DetailedHealthResponseDto,
  LivenessResponseDto,
  ReadinessResponseDto,
} from './dtos/health-response.dto';

@Controller('health')
@ApiTags('Health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Detailed health check',
    description:
      'Returns detailed system health information including dependency status, response times, memory metrics, and overall health status. Results are cached for 30 seconds.',
  })
  @ApiResponse({
    status: 200,
    description: 'System is healthy or degraded',
    type: DetailedHealthResponseDto,
  })
  @ApiResponse({
    status: 503,
    description: 'System is unhealthy (critical dependencies down)',
  })
  async getDetailedHealth() {
    const health = await this.healthService.getDetailedHealth();

    // Return 503 if system is unhealthy
    if (health.status === 'unhealthy') {
      throw new HttpException(health, HttpStatus.SERVICE_UNAVAILABLE);
    }

    return {
      success: true,
      status: 'success',
      message: 'Health check completed',
      data: health,
      status_code: 200,
    };
  }

  @Get('live')
  @ApiOperation({
    summary: 'Liveness probe',
    description:
      'Simple endpoint that returns 200 if the application is running. Used by container orchestration systems (Kubernetes, Docker) to determine if the container should be restarted.',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is alive',
    type: LivenessResponseDto,
  })
  checkLiveness() {
    const liveness = this.healthService.checkLiveness();

    return {
      success: true,
      status: 'success',
      message: 'Application is alive',
      data: liveness,
      status_code: 200,
    };
  }

  @Get('ready')
  @ApiOperation({
    summary: 'Readiness probe',
    description:
      'Returns 200 if the application is ready to serve traffic (critical dependencies are available). Returns 503 if not ready. Used by container orchestration systems to determine if traffic should be routed to this instance.',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is ready to serve traffic',
    type: ReadinessResponseDto,
  })
  @ApiResponse({
    status: 503,
    description: 'Application is not ready (critical dependencies unavailable)',
  })
  async checkReadiness() {
    const readiness = await this.healthService.checkReadiness();

    // Return 503 if not ready
    if (readiness.status === 'not_ready') {
      throw new HttpException(readiness, HttpStatus.SERVICE_UNAVAILABLE);
    }

    return {
      success: true,
      status: 'success',
      message: 'Application is ready',
      data: readiness,
      status_code: 200,
    };
  }

  // Legacy endpoint for backward compatibility
  @Get('legacy')
  @HealthDocs.check()
  async check() {
    const result = await this.healthService.checkHealth();

    if (result.httpStatus !== 200) {
      throw new HttpException(result, result.httpStatus);
    }

    return {
      success: true,
      status: 'success',
      message: 'Health check completed',
      data: {
        status: result.status,
        services: result.services,
        timestamp: result.timestamp,
      },
      status_code: 200,
    };
  }
}
