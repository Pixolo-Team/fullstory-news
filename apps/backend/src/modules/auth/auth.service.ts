// TYPES //
import type { AuthUser } from '@supabase/supabase-js';
import type { AuthSessionData, AuthUserData, SessionCookieData } from '@/modules/auth/auth.types.js';

// SERVICES //
import { AuthRepository } from '@/modules/auth/auth.repository.js';

// UTILS //
import { DependencyError, UnauthorizedError } from '@/common/errors/domain.error.js';

// LIBRARIES //
import { Injectable } from '@nestjs/common';

/** Cookie pair separator. */
const COOKIE_SEPARATOR = ';';

/** Prefix used before the base64-encoded session payload. */
const COOKIE_PREFIX = 'base64:';

/**
 * Business logic for login, logout, and current-session resolution.
 */
@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  /**
   * Authenticates an admin user and resolves the matching author profile.
   * @param email - Login email address
   * @param password - Login password
   * @returns The author data plus a cookie payload to persist
   */
  async loginService(email: string, password: string): Promise<AuthSessionData> {
    const result = await this.authRepository.signInWithPasswordRepository(email, password);

    if (result.error || !result.session || !result.user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const author = await this.getOrCreateAuthorService(result.user);

    return {
      author,
      sessionCookie: {
        accessToken: result.session.access_token,
        refreshToken: result.session.refresh_token,
      },
    };
  }

  /**
   * Resolves the current logged-in author from the cookie header.
   * @param cookieHeader - Raw Cookie header value
   * @param cookieName - Cookie name configured by the app
   * @returns The current author plus a refreshed cookie when tokens rotated
   */
  async getCurrentAuthorService(cookieHeader: string | undefined, cookieName: string): Promise<AuthSessionData> {
    const sessionCookie = this.readSessionCookie(cookieHeader, cookieName);

    if (!sessionCookie) {
      throw new UnauthorizedError('Session expired or missing');
    }

    const userResponse = await this.authRepository.getUserByAccessTokenRepository(sessionCookie.accessToken);

    if (userResponse.error === null && userResponse.data.user) {
      return {
        author: await this.getOrCreateAuthorService(userResponse.data.user),
        sessionCookie: null,
      };
    }

    const refreshedSession = await this.authRepository.refreshSessionRepository(sessionCookie.refreshToken);

    if (refreshedSession.error || !refreshedSession.session || !refreshedSession.user) {
      throw new UnauthorizedError('Session expired or missing');
    }

    return {
      author: await this.getOrCreateAuthorService(refreshedSession.user),
      sessionCookie: {
        accessToken: refreshedSession.session.access_token,
        refreshToken: refreshedSession.session.refresh_token,
      },
    };
  }

  /**
   * Performs any backend-side logout cleanup.
   * @returns Resolves when logout cleanup completes
   */
  async logoutService(): Promise<void> {
    try {
      await this.authRepository.signOutRepository();
    } catch {
      throw new DependencyError('Failed to clear the auth session');
    }
  }

  /**
   * Encodes the session cookie for transport.
   * @param sessionCookie - Session tokens to persist
   * @returns Encoded cookie value
   */
  encodeSessionCookieService(sessionCookie: SessionCookieData): string {
    const rawValue = JSON.stringify(sessionCookie);
    return `${COOKIE_PREFIX}${Buffer.from(rawValue, 'utf8').toString('base64url')}`;
  }

  /**
   * Reads and validates the session cookie payload.
   * @param cookieHeader - Raw Cookie header value
   * @param cookieName - Cookie name configured by the app
   * @returns Session cookie data when present and valid
   */
  private readSessionCookie(cookieHeader: string | undefined, cookieName: string): SessionCookieData | null {
    if (!cookieHeader) {
      return null;
    }

    const cookieEntry = cookieHeader
      .split(COOKIE_SEPARATOR)
      .map((value) => value.trim())
      .find((value) => value.startsWith(`${cookieName}=`));

    if (!cookieEntry) {
      return null;
    }

    const rawValue = cookieEntry.slice(cookieName.length + 1);

    // Express percent-encodes on the way out, so the value comes back as
    // "base64%3A..." from any client that replays the cookie verbatim - a
    // browser, Swagger UI, curl. Decode before testing the prefix.
    let encodedValue = rawValue;
    try {
      encodedValue = decodeURIComponent(rawValue);
    } catch {
      // Not percent-encoded; use the value as sent.
    }

    if (!encodedValue.startsWith(COOKIE_PREFIX)) {
      return null;
    }

    try {
      const decodedValue = Buffer.from(encodedValue.slice(COOKIE_PREFIX.length), 'base64url').toString('utf8');
      const parsedValue = JSON.parse(decodedValue) as Partial<SessionCookieData>;

      if (!parsedValue.accessToken || !parsedValue.refreshToken) {
        return null;
      }

      return {
        accessToken: parsedValue.accessToken,
        refreshToken: parsedValue.refreshToken,
      };
    } catch {
      return null;
    }
  }

  /**
   * Ensures an authenticated Supabase user has a matching author row.
   * @param user - Supabase auth user
   * @returns The mapped author data
   */
  private async getOrCreateAuthorService(user: AuthUser): Promise<import('@/modules/auth/auth.types.js').AuthorData> {
    const authUser = this.mapAuthUser(user);

    try {
      return await this.authRepository.upsertAuthorRepository(authUser);
    } catch {
      throw new DependencyError('Failed to resolve the author profile');
    }
  }

  /**
   * Maps Supabase auth user metadata to the local author shape.
   * @param user - Supabase auth user
   * @returns Normalised user data
   */
  private mapAuthUser(user: AuthUser): AuthUserData {
    const displayName = user.user_metadata.name ?? user.user_metadata.full_name ?? user.email?.split('@')[0] ?? 'Editor';

    return {
      id: user.id,
      email: user.email ?? '',
      name: String(displayName),
    };
  }
}
