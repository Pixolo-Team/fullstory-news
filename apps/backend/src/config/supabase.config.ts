// TYPES //
import type { SupabaseClient } from '@supabase/supabase-js';

// LIBRARIES //
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

/** Injection token for the shared Supabase client. */
export const SUPABASE_CLIENT = 'SUPABASE_CLIENT';

/**
 * Creates the single Supabase client used by every repository.
 *
 * Uses the secret key: this service must read drafts and write on behalf of the
 * admin, both of which RLS blocks for the publishable key. The secret key never
 * leaves this process - it is not exposed to the admin or the public site.
 *
 * @param configService - Nest config service holding validated env values
 * @returns A configured Supabase client with session persistence disabled
 */
export function createSupabaseClient(configService: ConfigService): SupabaseClient {
  const url = configService.get<string>('SUPABASE_URL');
  const secretKey = configService.get<string>('SUPABASE_SECRET_KEY');

  if (!url || !secretKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY must be set.');
  }

  return createClient(url, secretKey, {
    auth: {
      // This is a stateless API. No session is persisted or refreshed here.
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
