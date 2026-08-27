/**
 * Shared API response envelope returned by the backend.
 */
interface ApiResponseData<T> {
  data: T | null;
  status: 'success' | 'error';
  status_code: number;
  message: string;
  error: string | null;
}

/**
 * Status reported for a downstream dependency.
 */
interface DependencyHealthData {
  name: string;
  reachable: boolean;
  latencyMs: number;
}

/**
 * Health payload returned by the backend.
 */
export interface HealthData {
  status: 'ok' | 'degraded';
  service: string;
  uptimeSeconds: number;
  dependencies: DependencyHealthData[];
}

/**
 * Health request result for the public site.
 */
export interface HealthCheckData {
  health: HealthData | null;
  errorMessage: string | null;
}

/**
 * Fetches backend health for the public site.
 */
export async function getHealthRequest(): Promise<HealthCheckData> {
  const apiUrl = import.meta.env.PUBLIC_API_URL;

  if (!apiUrl) {
    return {
      health: null,
      errorMessage: 'PUBLIC_API_URL is missing.',
    };
  }

  try {
    const response = await fetch(`${apiUrl}/api/health`);

    if (!response.ok) {
      return {
        health: null,
        errorMessage: `Backend health request failed with status ${response.status}.`,
      };
    }

    const payload = (await response.json()) as ApiResponseData<HealthData>;

    return {
      health: payload.data,
      errorMessage: payload.data ? null : 'Backend returned an empty health payload.',
    };
  } catch (error) {
    return {
      health: null,
      errorMessage: error instanceof Error ? error.message : 'Backend health request failed.',
    };
  }
}
