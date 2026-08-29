// TYPES //
import type { DependencyHealthData, HealthData } from '@/modules/health/health.types.js';

// SERVICES //
import { HealthRepository } from '@/modules/health/health.repository.js';

// LIBRARIES //
import { Injectable } from '@nestjs/common';

/** Name reported in the health payload. */
const SERVICE_NAME = 'full-story-api';

/**
 * Health reporting.
 *
 * Never throws: a health endpoint that errors tells a load balancer nothing
 * useful. An unreachable dependency is reported as degraded instead.
 */
@Injectable()
export class HealthService {
  constructor(private readonly healthRepository: HealthRepository) {}

  /**
   * Builds the service health report
   * @returns Health status including every checked dependency
   */
  async getHealthService(): Promise<HealthData> {
    const dependencies: DependencyHealthData[] = [await this.checkSupabase()];
    const allReachable = dependencies.every((dependency) => dependency.reachable);

    return {
      status: allReachable ? 'ok' : 'degraded',
      service: SERVICE_NAME,
      uptimeSeconds: Math.floor(process.uptime()),
      dependencies,
    };
  }

  /**
   * Measures Supabase reachability and latency
   * @returns The dependency health entry for Supabase
   */
  private async checkSupabase(): Promise<DependencyHealthData> {
    const startedAt = Date.now();
    const reachable = await this.healthRepository.pingSupabaseRepository();

    return {
      name: 'supabase',
      reachable,
      latencyMs: Date.now() - startedAt,
    };
  }
}
