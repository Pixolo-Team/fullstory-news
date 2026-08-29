// TYPES //
import type { PaginatedData } from '@/common/types/api-response.types.js';
import type { Request, Response } from 'express';
import type { AppConfigData } from '@/config/app.config.js';
import type {
  ArticleCategoryGroupData,
  ArticleDetailData,
  ArticleInstagramPostData,
  ArticleListItemData,
} from '@/modules/articles/articles.types.js';

// CONFIG //
import { buildAppConfig } from '@/config/app.config.js';

// SERVICES //
import { ArticlesService } from '@/modules/articles/articles.service.js';
import { AuthService } from '@/modules/auth/auth.service.js';

// LIBRARIES //
import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Put, Query, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateArticleDto, GetArticlesDto, UpdateArticleDto, UpdateArticleInstagramDto } from '@/modules/articles/articles.dto.js';

/**
 * Article endpoints for public and admin callers.
 */
@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  private readonly appConfig: AppConfigData;

  constructor(
    private readonly articlesService: ArticlesService,
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    this.appConfig = buildAppConfig(configService);
  }

  /**
   * Returns article list data.
   * @param query - Caller-supplied filters and pagination
   * @param request - Express request used to inspect optional auth
   * @returns Paginated article list items
   */
  @Get()
  @ApiOperation({ summary: 'List articles' })
  async getArticles(
    @Query() query: GetArticlesDto,
    @Req() request: Request,
  ): Promise<PaginatedData<ArticleListItemData>> {
    const isAuthenticated = await this.isAuthenticatedRequest(request);
    return this.articlesService.getArticlesService(query, isAuthenticated);
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
  async getArticleById(
    @Param('id') id: string,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ArticleDetailData> {
    await this.authenticateRequest(request, response);
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
  async createArticle(
    @Body() body: CreateArticleDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ArticleDetailData> {
    const session = await this.authenticateRequest(request, response);
    return this.articlesService.createArticleService(body, session.author);
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
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ArticleDetailData> {
    await this.authenticateRequest(request, response);
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
  async deleteArticle(
    @Param('id') id: string,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<null> {
    await this.authenticateRequest(request, response);
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
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ArticleInstagramPostData[]> {
    await this.authenticateRequest(request, response);
    return this.articlesService.updateArticleInstagramService(id, body.urls);
  }

  /**
   * Resolves the current authenticated admin session.
   * @param request - Express request containing the session cookie
   * @param response - Express response used when tokens rotate
   * @returns Resolved session data
   */
  private async authenticateRequest(request: Request, response: Response) {
    const session = await this.authService.getCurrentAuthorService(
      request.headers.cookie,
      this.appConfig.sessionCookieName,
    );

    if (session.sessionCookie) {
      response.cookie(
        this.appConfig.sessionCookieName,
        this.authService.encodeSessionCookieService(session.sessionCookie),
        {
          httpOnly: true,
          sameSite: 'lax',
          secure: this.appConfig.isProduction,
          maxAge: this.appConfig.sessionCookieMaxAgeMs,
          path: '/',
        },
      );
    }

    return session;
  }

  /**
   * Determines whether the caller has a valid admin session.
   * @param request - Express request containing the session cookie
   * @returns True when the request is authenticated
   */
  private async isAuthenticatedRequest(request: Request): Promise<boolean> {
    try {
      await this.authService.getCurrentAuthorService(request.headers.cookie, this.appConfig.sessionCookieName);
      return true;
    } catch {
      return false;
    }
  }
}
