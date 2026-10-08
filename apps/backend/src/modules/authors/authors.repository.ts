// TYPES //
import type { SupabaseClient } from '@supabase/supabase-js';

// CONFIG //
import { SUPABASE_CLIENT } from '@/config/supabase.config.js';

// LIBRARIES //
import { Inject, Injectable } from '@nestjs/common';

/** Raw row shape from the authors table. */
export interface AuthorRowData {
  id: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
}

/**
 * Data access for author profiles.
 */
@Injectable()
export class AuthorsRepository {
  constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

  /**
   * Reads every author.
   *
   * The whole table is read because `authors` has no slug column and a byline
   * URL is matched against a slug derived from the name. The newsroom is a
   * handful of rows, so a filter pushed into Postgres would cost more in
   * schema than it saves in transfer.
   *
   * @returns Author rows in name order
   */
  async findAuthorsRepository(): Promise<AuthorRowData[]> {
    const { data, error } = await this.supabase
      .from('authors')
      .select('id, name, avatar_url, bio')
      .order('name', { ascending: true })
      .returns<AuthorRowData[]>();

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  }
}
