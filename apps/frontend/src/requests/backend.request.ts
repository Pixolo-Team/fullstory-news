// TYPES //
import type { ApiResponseData } from '@/types/api.types';

/**
 * Returns the configured backend base URL.
 * @returns Backend base URL
 */
function getBackendBaseUrl(): string {
  return import.meta.env.PUBLIC_API_URL ?? 'http://localhost:4000';
}

/**
 * Reads a backend response, tolerating an empty body.
 * @param response - Fetch response
 * @returns Parsed envelope
 */
async function parseResponse<T>(response: Response): Promise<ApiResponseData<T>> {
  const rawBody = await response.text();

  if (!rawBody) {
    return {
      data: null,
      status: response.ok ? 'success' : 'error',
      status_code: response.status,
      message: response.statusText,
      error: response.ok ? null : response.statusText,
    };
  }

  try {
    return JSON.parse(rawBody) as ApiResponseData<T>;
  } catch {
    return {
      data: null,
      status: 'error',
      status_code: response.status,
      message: 'Backend returned an unreadable response.',
      error: 'PARSE_FAILED',
    };
  }
}

/**
 * Sends a public read request to the backend.
 *
 * Never throws: the public site must render something even when the API is
 * unreachable, so callers decide what an empty result looks like.
 *
 * @param path - API path including the leading slash
 * @returns Parsed backend envelope
 */
export async function sendBackendRequest<T>(path: string): Promise<ApiResponseData<T>> {
  try {
    const response = await fetch(`${getBackendBaseUrl()}${path}`);
    return await parseResponse<T>(response);
  } catch (error) {
    return {
      data: null,
      status: 'error',
      status_code: 503,
      message: error instanceof Error ? error.message : 'Backend request failed.',
      error: 'UNREACHABLE',
    };
  }
}
