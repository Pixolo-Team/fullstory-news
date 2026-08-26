// TYPES //
import type { SupabaseClient } from '@supabase/supabase-js';

// CONFIG //
import { SUPABASE_CLIENT } from '@/config/supabase.config.js';

// LIBRARIES //
import { Inject, Injectable } from '@nestjs/common';

/**
 * Data access for health checks.
 *
 * The only layer permitted to touch Supabase, per the architecture rules.
 */
@Injectable()
export class HealthRepository {
  constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

  /**
   * Confirms Supabase answers a request
   * @returns True when Supabase responds, false when it does not
   */
  async pingSupabaseRepository(): Promise<boolean> {
    try {
      // getSession touches the auth endpoint without needing any table to exist,
      // so this check keeps working before the schema is created.
      const { error } = await this.supabase.auth.getSession();
      return error === null;
    } catch {
      return false;
    }
  }
}
