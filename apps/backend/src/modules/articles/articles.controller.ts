// TYPES //
import type { PaginatedData } from '@/common/types/api-response.types.js';
import type {
  ArticleCategoryGroupData,
  ArticleDetailData,
  ArticleInstagramPostData,
  ArticleListItemData,
} from '@/modules/articles/articles.types.js';

// SERVICES //
import { ArticlesService } from '@/modules/articles/articles.service.js';

// LIBRARIES //
import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateArticleDto, GetArticlesDto, UpdateArticleDto, UpdateArticleInstagramDto } from '@/modules/articles/articles.dto.js';

/**
 * Article endpoints for public and admin callers.
 */
@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  /**
   * Returns article list data.
   * @param query - Caller-supplied filters and pagination
   * @returns Paginated article list items
   */
  @Get()
  @ApiOperation({ summary: 'List articles' })
  async getArticles(
    @Query() query: GetArticlesDto,
  ): Promise<PaginatedData<ArticleListItemData>> {
    // Stories CRUD is unauthenticated, so an explicit status is taken at face
    // value: the admin lists drafts without a session. Omitting status still
    // means published only, because the public site calls this route that way
    // and must never render unpublished journalism.
    return this.articlesService.getArticlesService(query, query.status !== undefined);
  }

  /**
   * Returns trending article list data.
   * @param limit - Max rows to return
   * @returns Trending article list items
   */
  @Get('trending')
  @ApiOperation({ summary: 'List trending published articles' })
  async getTrendingArticles(@Query('limit') limit?: number): Promise<ArticleListItemData[]> {
    return this.articlesService.getTrendingArticlesService(limit);
  }

  /**
   * Returns latest published article list data.
   * @param limit - Max rows to return
   * @returns Latest article list items
   */
  @Get('latest')
  @ApiOperation({ summary: 'List latest published articles' })
  async getLatestArticles(@Query('limit') limit?: number): Promise<ArticleListItemData[]> {
    return this.articlesService.getLatestArticlesService(limit);
  }

  /**
   * Returns latest published articles grouped by category.
   * @param limit - Max rows per category
   * @returns Category groups for the home page
   */
  @Get('by-category')
  @ApiOperation({ summary: 'List latest published articles grouped by category' })
  async getArticlesByCategory(@Query('limit') limit?: number): Promise<ArticleCategoryGroupData[]> {
    return this.articlesService.getArticlesByCategoryService(limit);
  }

  /**
   * Returns one published article and records a view.
   * @param slug - Public article slug
   * @param id - Article id
   * @returns Full article detail
   */
  @Get(':id/similar')
  @ApiOperation({ summary: 'List similar published articles' })
  async getSimilarArticles(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ): Promise<ArticleListItemData[]> {
    return this.articlesService.getSimilarArticlesService(id, limit);
  }

  /**
   * Returns one published article and records a view.
   * @param slug - Public article slug
   * @param id - Article id
   * @returns Full article detail
   */
  @Get(':slug/:id')
  @ApiOperation({ summary: 'Get one published article by slug and id' })
  async getPublishedArticleBySlug(
    @Param('slug') slug: string,
    @Param('id') id: string,
  ): Promise<ArticleDetailData> {
    return this.articlesService.getPublishedArticleBySlugService(slug, id);
  }

  /**
   * Returns one article for admin editing without recording a view.
   * @param id - Article id
   * @param request - Express request containing the session cookie
   * @param response - Express response used when tokens rotate
   * @returns Full article detail
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get one article for admin editing' })
  async getArticleById(@Param('id') id: string): Promise<ArticleDetailData> {
    return this.articlesService.getArticleByIdService(id);
  }

  /**
   * Creates a new draft article.
   * @param body - Article payload
   * @param request - Express request containing the session cookie
   * @param response - Express response used when tokens rotate
   * @returns Created article detail
   */
  @Post()
  @ApiOperation({ summary: 'Create a draft article' })
  async createArticle(@Body() body: CreateArticleDto): Promise<ArticleDetailData> {
    return this.articlesService.createArticleService(body);
  }

  /**
   * Updates an existing article.
   * @param id - Article id
   * @param body - Partial update payload
   * @param request - Express request containing the session cookie
   * @param response - Express response used when tokens rotate
   * @returns Updated article detail
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update an article' })
  async updateArticle(
    @Param('id') id: string,
    @Body() body: UpdateArticleDto,
  ): Promise<ArticleDetailData> {
    return this.articlesService.updateArticleService(id, body);
  }

  /**
   * Deletes an article and its dependent rows.
   * @param id - Article id
   * @param request - Express request containing the session cookie
   * @param response - Express response used when tokens rotate
   * @returns Null payload on success
   */
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an article' })
  async deleteArticle(@Param('id') id: string): Promise<null> {
    return this.articlesService.deleteArticleService(id);
  }

  /**
   * Replaces the article's ordered Instagram URLs.
   * @param id - Article id
   * @param body - Ordered Instagram URL payload
   * @param request - Express request containing the session cookie
   * @param response - Express response used when tokens rotate
   * @returns Stored Instagram post rows
   */
  @Put(':id/instagram')
  @ApiOperation({ summary: 'Replace ordered Instagram URLs for an article' })
  async updateArticleInstagram(
    @Param('id') id: string,
    @Body() body: UpdateArticleInstagramDto,
  ): Promise<ArticleInstagramPostData[]> {
    return this.articlesService.updateArticleInstagramService(id, body.urls);
  }
}
