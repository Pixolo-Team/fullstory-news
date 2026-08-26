// CONFIG //
import { validateEnvironment } from '@/config/env.validation.js';
import { SupabaseModule } from '@/config/supabase.module.js';

// SERVICES //
import { HealthModule } from '@/modules/health/health.module.js';

// LIBRARIES //
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

/**
 * Application root.
 *
 * Feature modules are added here as they are built. Planned, per docs/api.md:
 *   AuthModule, CategoriesModule, ArticlesModule, SearchModule, MediaModule
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnvironment,
    }),
    SupabaseModule,
    HealthModule,
  ],
})
export class AppModule {}
