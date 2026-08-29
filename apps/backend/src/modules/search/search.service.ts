// TYPES //
import type { PaginatedData } from '@/common/types/api-response.types.js';
import type { ArticleListItemData } from '@/modules/articles/articles.types.js';

// SERVICES //
import { ArticlesService } from '@/modules/articles/articles.service.js';

// UTILS //
import { ValidationError } from '@/common/errors/domain.error.js';

// LIBRARIES //
import { Injectable } from '@nestjs/common';

/**
 * Published article search logic.
 */
@Injectable()
export class SearchService {
  constructor(private readonly articlesService: ArticlesService) {}

  /**
   * Searches published articles.
   * @param query - Search term and pagination input
   * @returns Paginated published article matches
   */
  async searchArticlesService(query: {
    q: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedData<ArticleListItemData>> {
    if (!query.q || query.q.trim().length === 0) {
      throw new ValidationError('Search query is required');
    }

    return this.articlesService.getArticlesService(
      {
        q: query.q.trim(),
        page: query.page,
        limit: query.limit,
      },
      false,
    );
  }
}
