// TYPES //
import type { SupabaseClient } from '@supabase/supabase-js';

// CONFIG //
import { SUPABASE_CLIENT } from '@/config/supabase.config.js';

// LIBRARIES //
import { Inject, Injectable } from '@nestjs/common';

/**
 * Data access for dashboard statistics.
 */
@Injectable()
export class AdminRepository {
  constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

  /**
   * Counts categories for the dashboard.
   * @returns Category count
   */
  async countCategoriesRepository(): Promise<number> {
    const { count, error } = await this.supabase.from('categories').select('id', { count: 'exact', head: true });

    if (error) {
      throw new Error(error.message);
    }

    return count ?? 0;
  }
}
