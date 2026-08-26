/** Reported state of a single downstream dependency. */
export interface DependencyHealthData {
  name: string;
  reachable: boolean;
  latencyMs: number;
}

/** Full health report returned by GET /api/health. */
export interface HealthData {
  status: 'ok' | 'degraded';
  service: string;
  uptimeSeconds: number;
  dependencies: DependencyHealthData[];
}
