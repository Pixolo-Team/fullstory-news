// CONFIG //
import {
  createSupabaseAuthClient,
  createSupabaseClient,
  SUPABASE_AUTH_CLIENT,
  SUPABASE_CLIENT,
} from '@/config/supabase.config.js';

// LIBRARIES //
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Provides the shared Supabase client application-wide.
 *
 * Global so repositories inject the client without every feature module
 * re-importing it. Repositories are the only layer allowed to use it.
 */
@Global()
@Module({
  providers: [
    {
      provide: SUPABASE_CLIENT,
      inject: [ConfigService],
      useFactory: createSupabaseClient,
    },
    {
      provide: SUPABASE_AUTH_CLIENT,
      inject: [ConfigService],
      useFactory: createSupabaseAuthClient,
    },
  ],
  exports: [SUPABASE_CLIENT, SUPABASE_AUTH_CLIENT],
})
export class SupabaseModule {}
