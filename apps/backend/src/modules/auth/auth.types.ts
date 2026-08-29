/**
 * Author profile exposed to authenticated admin callers.
 */
export interface AuthorData {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

/**
 * Session cookie payload stored in the browser.
 */
export interface SessionCookieData {
  accessToken: string;
  refreshToken: string;
}

/**
 * Session resolution result returned by auth services.
 */
export interface AuthSessionData {
  author: AuthorData;
  sessionCookie: SessionCookieData | null;
}

/**
 * Minimal auth user data returned by Supabase.
 */
export interface AuthUserData {
  id: string;
  email: string;
  name: string;
}
