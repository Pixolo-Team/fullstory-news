// TYPES //
import type { PaginatedData } from '@/common/types/api-response.types.js';
import type { ArticleListItemData } from '@/modules/articles/articles.types.js';

// SERVICES //
import { SearchService } from '@/modules/search/search.service.js';

// LIBRARIES //
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SearchArticlesDto } from '@/modules/search/search.dto.js';

/**
 * Search endpoints.
 */
@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * Returns published article search results.
   * @param query - Search query string and pagination
   * @returns Paginated matching article list items
   */
  @Get()
  @ApiOperation({ summary: 'Search published articles' })
  async searchArticles(@Query() query: SearchArticlesDto): Promise<PaginatedData<ArticleListItemData>> {
    return this.searchService.searchArticlesService(query);
  }
}
