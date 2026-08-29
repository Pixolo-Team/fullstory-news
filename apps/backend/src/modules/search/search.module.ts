// SERVICES //
import { ArticlesModule } from '@/modules/articles/articles.module.js';
import { SearchController } from '@/modules/search/search.controller.js';
import { SearchService } from '@/modules/search/search.service.js';

// LIBRARIES //
import { Module } from '@nestjs/common';

/**
 * Search module.
 */
@Module({
  imports: [ArticlesModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
