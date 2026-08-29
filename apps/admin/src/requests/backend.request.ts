import 'server-only';

// TYPES //
import type { ApiResponseData } from '@/types/api.types';

// SERVICES //
import { extractSessionCookieService } from '@/services/extract-session-cookie.service';

// LIBRARIES //
import { cookies } from 'next/headers';

/**
 * Persists a rotated admin session cookie returned by the backend.
 * @param cookieStore - Next.js cookie store for the current request
 * @param response - Backend response that may contain Set-Cookie
 * @returns Resolves when any rotated cookie has been stored
 */
async function persistRotatedSessionCookieRequest(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  response: Response,
): Promise<void> {
  const nextSessionCookie = extractSessionCookieService(response.headers.get('set-cookie'));

  if (!nextSessionCookie) {
    return;
  }

  cookieStore.set('fs_session', nextSessionCookie, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

/**
 * Builds a consistent error envelope for failed backend requests.
 * @param message - Client-safe error message
 * @returns Error envelope matching the backend contract
 */
function buildErrorResponseRequest<T>(message: string): ApiResponseData<T> {
  return {
    data: null,
    status: 'error',
    status_code: 503,
    message,
    error: message,
  };
}

/**
 * Reads a backend response body, tolerating an empty one.
 *
 * DELETE returns 204 No Content, so calling response.json() unconditionally
 * throws "Unexpected end of JSON input" on a request that actually succeeded.
 *
 * @param response - Fetch response from the backend
 * @returns The parsed envelope, or a synthesised one for an empty body
 */
async function parseBackendResponse<T>(response: Response): Promise<ApiResponseData<T>> {
  const rawBody = await response.text();

  if (!rawBody) {
    return {
      data: null,
      status: response.ok ? 'success' : 'error',
      status_code: response.status,
      message: response.ok ? 'Request completed successfully' : response.statusText,
      error: response.ok ? null : response.statusText,
    };
  }

  try {
    return JSON.parse(rawBody) as ApiResponseData<T>;
  } catch {
    return buildErrorResponseRequest<T>(`Backend returned an unreadable response (HTTP ${response.status}).`);
  }
}

/**
 * Returns the configured backend base URL.
 * @returns Backend base URL for server-side requests
 */
export function getBackendBaseUrlRequest(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is missing.');
  }

  return apiUrl;
}

/**
 * Sends a backend request with the current admin session cookie attached.
 * @param path - Backend API path including leading slash
 * @param init - Fetch options for the request
 * @returns Parsed backend response envelope
 */
export async function sendBackendRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResponseData<T>> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('fs_session')?.value;

  try {
    const response = await fetch(`${getBackendBaseUrlRequest()}${path}`, {
      ...init,
      cache: 'no-store',
      headers: {
        ...(init?.headers ?? {}),
        ...(sessionCookie ? { Cookie: `fs_session=${sessionCookie}` } : {}),
      },
    });

    await persistRotatedSessionCookieRequest(cookieStore, response);
    return await parseBackendResponse<T>(response);
  } catch (error) {
    return buildErrorResponseRequest<T>(
      error instanceof Error ? error.message : 'Backend request failed.',
    );
  }
}

/**
 * Sends a backend mutation request and persists any rotated session cookie.
 * @param path - Backend API path including leading slash
 * @param init - Fetch options for the request
 * @returns Parsed backend response envelope
 */
export async function sendBackendMutationRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResponseData<T>> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('fs_session')?.value;
  try {
    const response = await fetch(`${getBackendBaseUrlRequest()}${path}`, {
      ...init,
      cache: 'no-store',
      headers: {
        ...(init?.headers ?? {}),
        ...(sessionCookie ? { Cookie: `fs_session=${sessionCookie}` } : {}),
      },
    });

    await persistRotatedSessionCookieRequest(cookieStore, response);
    return await parseBackendResponse<T>(response);
  } catch (error) {
    return buildErrorResponseRequest<T>(
      error instanceof Error ? error.message : 'Backend request failed.',
    );
  }
}
