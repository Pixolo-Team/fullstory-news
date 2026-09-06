'use server';

// TYPES //
import type { ApiResponseData } from '@/types/api.types';

// SERVICES //
import { extractSessionCookieService } from '@/services/extract-session-cookie.service';

// LIBRARIES //
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Reads the backend login response without crashing on empty or non-JSON bodies.
 * @param response - Backend auth response
 * @returns Parsed backend envelope, or a fallback error payload
 */
async function parseLoginResponseRequest(response: Response): Promise<ApiResponseData<unknown>> {
  const rawBody = await response.text();

  if (!rawBody) {
    return {
      data: null,
      status: response.ok ? 'success' : 'error',
      status_code: response.status,
      message: response.statusText || 'Login failed.',
      error: response.ok ? null : response.statusText || 'Login failed.',
    };
  }

  try {
    return JSON.parse(rawBody) as ApiResponseData<unknown>;
  } catch {
    return {
      data: null,
      status: 'error',
      status_code: response.status,
      message: `Backend returned an unreadable response (HTTP ${response.status}).`,
      error: `Backend returned an unreadable response (HTTP ${response.status}).`,
    };
  }
}

/**
 * Logs an admin user in through the backend and stores the session cookie locally.
 * @param _previousState - Prior form state
 * @param formData - Login form values
 * @returns Redirects on success or the error state on failure
 */
export async function loginAction(
  _previousState: { errorMessage: string | null },
  formData: FormData,
): Promise<{ errorMessage: string | null }> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return { errorMessage: 'NEXT_PUBLIC_API_URL is missing.' };
  }

  let response: Response;

  try {
    response = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: String(formData.get('email') ?? ''),
        password: String(formData.get('password') ?? ''),
      }),
    });
  } catch (error) {
    return {
      errorMessage: error instanceof Error ? error.message : 'Backend request failed.',
    };
  }

  const payload = await parseLoginResponseRequest(response);

  if (!response.ok) {
    return {
      errorMessage: payload.error ?? payload.message ?? 'Login failed.',
    };
  }

  const cookieValue = extractSessionCookieService(response.headers.get('set-cookie'));

  if (!cookieValue) {
    return {
      errorMessage: 'Backend did not return a session cookie.',
    };
  }

  const cookieStore = await cookies();
  cookieStore.set('fs_session', cookieValue, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  redirect('/');
}

/**
 * Logs the current admin user out and clears the local session cookie.
 */
export async function logoutAction(): Promise<void> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('fs_session')?.value;

  if (apiUrl) {
    await fetch(`${apiUrl}/api/auth/logout`, {
      method: 'POST',
      cache: 'no-store',
      headers: sessionCookie ? { Cookie: `fs_session=${sessionCookie}` } : {},
    });
  }

  cookieStore.delete('fs_session');
  redirect('/login');
}
