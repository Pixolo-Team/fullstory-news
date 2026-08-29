// SERVICES //
import { ArticlesController } from '@/modules/articles/articles.controller.js';
import { ArticlesRepository } from '@/modules/articles/articles.repository.js';
import { ArticlesService } from '@/modules/articles/articles.service.js';
import { AuthModule } from '@/modules/auth/auth.module.js';
import { CategoriesModule } from '@/modules/categories/categories.module.js';

// LIBRARIES //
import { Module } from '@nestjs/common';

/**
 * Articles module.
 */
@Module({
  imports: [AuthModule, CategoriesModule],
  controllers: [ArticlesController],
  providers: [ArticlesRepository, ArticlesService],
  exports: [ArticlesRepository, ArticlesService],
})
export class ArticlesModule {}
