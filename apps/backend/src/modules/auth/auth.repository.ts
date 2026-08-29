// TYPES //
import type { AuthSession, AuthUser, SupabaseClient, UserResponse } from '@supabase/supabase-js';
import type { AuthUserData, AuthorData } from '@/modules/auth/auth.types.js';

// CONFIG //
import { SUPABASE_AUTH_CLIENT, SUPABASE_CLIENT } from '@/config/supabase.config.js';

// LIBRARIES //
import { Inject, Injectable } from '@nestjs/common';

/** Row shape read from the authors table. */
interface AuthorRowData {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
}

/**
 * Data access for auth and session resolution.
 */
@Injectable()
export class AuthRepository {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
    @Inject(SUPABASE_AUTH_CLIENT) private readonly authClient: SupabaseClient,
  ) {}

  /**
   * Signs a user in with email and password.
   * @param email - User email address
   * @param password - Plain-text password supplied by the user
   * @returns The Supabase auth session and user
   */
  async signInWithPasswordRepository(
    email: string,
    password: string,
  ): Promise<{ session: AuthSession | null; user: AuthUser | null; error: string | null }> {
    const { data, error } = await this.authClient.auth.signInWithPassword({
      email,
      password,
    });

    return {
      session: data.session,
      user: data.user,
      error: error?.message ?? null,
    };
  }

  /**
   * Signs out the current auth session best-effort.
   * @returns Resolves when the sign-out attempt completes
   */
  async signOutRepository(): Promise<void> {
    await this.authClient.auth.signOut();
  }

  /**
   * Resolves an auth user from an access token.
   * @param accessToken - Supabase access token
   * @returns The resolved user response
   */
  async getUserByAccessTokenRepository(accessToken: string): Promise<UserResponse> {
    return this.authClient.auth.getUser(accessToken);
  }

  /**
   * Refreshes an expired auth session.
   * @param refreshToken - Supabase refresh token
   * @returns The refreshed session and user
   */
  async refreshSessionRepository(
    refreshToken: string,
  ): Promise<{ session: AuthSession | null; user: AuthUser | null; error: string | null }> {
    const { data, error } = await this.authClient.auth.refreshSession({
      refresh_token: refreshToken,
    });

    return {
      session: data.session,
      user: data.user,
      error: error?.message ?? null,
    };
  }

  /**
   * Finds the author row mapped to a Supabase auth user.
   * @param userId - Supabase auth user id
   * @returns The author row when present
   */
  async findAuthorByUserIdRepository(userId: string): Promise<AuthorData | null> {
    const { data, error } = await this.supabase
      .from('authors')
      .select('id, name, email, avatar_url')
      .eq('user_id', userId)
      .maybeSingle<AuthorRowData>();

    if (error) {
      throw new Error(error.message);
    }

    return data ? this.mapAuthorRow(data) : null;
  }

  /**
   * Creates or updates the author row for the authenticated user.
   * @param user - Auth user data from Supabase
   * @returns The persisted author row
   */
  async upsertAuthorRepository(user: AuthUserData): Promise<AuthorData> {
    const existingAuthor = await this.findAuthorByUserIdRepository(user.id);

    if (existingAuthor) {
      return existingAuthor;
    }

    const { data, error } = await this.supabase
      .from('authors')
      .insert({
        user_id: user.id,
        email: user.email,
        name: user.name,
      })
      .select('id, name, email, avatar_url')
      .single<AuthorRowData>();

    if (error) {
      throw new Error(error.message);
    }

    return this.mapAuthorRow(data);
  }

  /**
   * Finds an author row by email address.
   * @param email - Author email address
   * @returns Matching author when present
   */
  async findAuthorByEmailRepository(email: string): Promise<AuthorData | null> {
    const { data, error } = await this.supabase
      .from('authors')
      .select('id, name, email, avatar_url')
      .eq('email', email)
      .maybeSingle<AuthorRowData>();

    if (error) {
      throw new Error(error.message);
    }

    return data ? this.mapAuthorRow(data) : null;
  }

  /**
   * Maps a raw author row to the API shape.
   * @param row - Raw database row
   * @returns Normalised author data
   */
  private mapAuthorRow(row: AuthorRowData): AuthorData {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      avatarUrl: row.avatar_url,
    };
  }
}
