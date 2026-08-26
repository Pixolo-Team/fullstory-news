// SERVICES //
import { HealthController } from '@/modules/health/health.controller.js';
import { HealthRepository } from '@/modules/health/health.repository.js';
import { HealthService } from '@/modules/health/health.service.js';

// LIBRARIES //
import { Module } from '@nestjs/common';

/** Wires the health check controller, service and repository. */
@Module({
  controllers: [HealthController],
  providers: [HealthService, HealthRepository],
})
export class HealthModule {}
