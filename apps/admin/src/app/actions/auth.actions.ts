'use server';

// SERVICES //
import { extractSessionCookieService } from '@/services/extract-session-cookie.service';

// LIBRARIES //
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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

  const response = await fetch(`${apiUrl}/api/auth/login`, {
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

  const payload = (await response.json()) as { error?: string | null };

  if (!response.ok) {
    return {
      errorMessage: payload.error ?? 'Login failed.',
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
