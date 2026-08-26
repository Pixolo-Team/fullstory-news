// TYPES //
import type { HealthData } from '@/modules/health/health.types.js';

// SERVICES //
import { HealthService } from '@/modules/health/health.service.js';

// LIBRARIES //
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

/**
 * Liveness and dependency checks.
 *
 * Deliberately unauthenticated so uptime monitors and platform health probes
 * can reach it.
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * Returns service health and dependency status
   * @returns Health report wrapped by ResponseInterceptor
   */
  @Get()
  @ApiOperation({ summary: 'Service health and dependency status' })
  @ApiOkResponse({ description: 'Service is reachable. Check status for degraded dependencies.' })
  async getHealth(): Promise<HealthData> {
    return this.healthService.getHealthService();
  }
}
