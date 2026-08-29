// CONFIG //
import { validateEnvironment } from '@/config/env.validation.js';
import { SupabaseModule } from '@/config/supabase.module.js';

// SERVICES //
import { AdminModule } from '@/modules/admin/admin.module.js';
import { ArticlesModule } from '@/modules/articles/articles.module.js';
import { AuthModule } from '@/modules/auth/auth.module.js';
import { CategoriesModule } from '@/modules/categories/categories.module.js';
import { HealthModule } from '@/modules/health/health.module.js';
import { MediaModule } from '@/modules/media/media.module.js';
import { SearchModule } from '@/modules/search/search.module.js';

// LIBRARIES //
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

/**
 * Application root.
 *
 * Application root module wiring every built feature module.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnvironment,
    }),
    SupabaseModule,
    AuthModule,
    CategoriesModule,
    ArticlesModule,
    SearchModule,
    AdminModule,
    MediaModule,
    HealthModule,
  ],
})
export class AppModule {}
