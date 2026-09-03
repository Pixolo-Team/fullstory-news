// TYPES //
import type { PaginatedData } from '@/common/types/api-response.types.js';
import type { AuthorData } from '@/modules/auth/auth.types.js';
import type {
  ArticleCategoryGroupData,
  ArticleDetailData,
  ArticleInstagramPostData,
  ArticleListItemData,
} from '@/modules/articles/articles.types.js';

// CONSTANTS //
import { TRENDING_WINDOW_DAYS } from '@/common/constants/pagination.constants.js';

// SERVICES //
import { ArticlesRepository } from '@/modules/articles/articles.repository.js';
import { CategoriesRepository } from '@/modules/categories/categories.repository.js';

// UTILS //
import { ConflictError, DependencyError, NotFoundError, ValidationError } from '@/common/errors/domain.error.js';
import { sanitizeHtmlUtil } from '@/common/utils/html-sanitizer.util.js';
import { getPaginationUtil } from '@/common/utils/pagination.util.js';
import { toSlugUtil } from '@/common/utils/slug.util.js';
import { ArticleSortData, ArticleStatusData } from '@/modules/articles/articles.types.js';

// LIBRARIES //
import { Injectable, Logger } from '@nestjs/common';

/**
 * Article business logic.
 */
@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(
    private readonly articlesRepository: ArticlesRepository,
    private readonly categoriesRepository: CategoriesRepository,
  ) {}

  /**
   * Lists articles with pagination and filtering.
   * @param query - Filter and pagination input
   * @param includeDrafts - Whether draft content may be returned
   * @returns Paginated article list items
   */
  async getArticlesService(
    query: {
      category?: string;
      sort?: ArticleSortData;
      status?: ArticleStatusData | 'all';
      q?: string;
      page?: number;
      limit?: number;
    },
    includeDrafts: boolean,
  ): Promise<PaginatedData<ArticleListItemData>> {
    const pagination = getPaginationUtil(query.page, query.limit);

    try {
      const [items, total] = await Promise.all([
        this.articlesRepository.findArticlesRepository(
          {
            ...query,
            page: pagination.page,
            limit: pagination.limit,
          },
          includeDrafts,
        ),
        this.articlesRepository.countArticlesRepository(query, includeDrafts),
      ]);

      return {
        items,
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / pagination.limit),
      };
    } catch {
      throw new DependencyError('Failed to load articles');
    }
  }

  /**
   * Returns trending published articles over the rolling view window.
   * @param limit - Max articles to return
   * @returns Trending article list items
   */
  async getTrendingArticlesService(limit = 3): Promise<ArticleListItemData[]> {
    const viewedAfter = new Date(Date.now() - TRENDING_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();

    try {
      const views = await this.articlesRepository.findRecentArticleViewsRepository(viewedAfter);
      const counts = new Map<string, number>();

      views.forEach((view) => {
        counts.set(view.articleId, (counts.get(view.articleId) ?? 0) + 1);
      });

      const orderedIds = [...counts.entries()]
        .sort((left, right) => right[1] - left[1])
        .slice(0, limit)
        .map(([articleId]) => articleId);

      const items = await this.articlesRepository.findArticlesByIdsRepository(orderedIds);
      const orderMap = new Map(orderedIds.map((id, index) => [id, index]));

      return items.sort((left, right) => (orderMap.get(left.id) ?? 0) - (orderMap.get(right.id) ?? 0));
    } catch {
      throw new DependencyError('Failed to load trending articles');
    }
  }

  /**
   * Returns the latest published articles.
   * @param limit - Max articles to return
   * @returns Latest article list items
   */
  async getLatestArticlesService(limit = 10): Promise<ArticleListItemData[]> {
    const result = await this.getArticlesService(
      {
        sort: ArticleSortData.Published,
        limit,
      },
      false,
    );

    return result.items;
  }

  /**
   * Returns latest published articles grouped by category.
   * @param limit - Max items per category
   * @returns Category groupings for the home page
   */
  async getArticlesByCategoryService(limit = 4): Promise<ArticleCategoryGroupData[]> {
    try {
      const categories = await this.categoriesRepository.findCategoriesRepository();
      const groups = await Promise.all(
        categories.map(async (category) => ({
          category,
          items: (
            await this.getArticlesService(
              {
                category: category.slug,
                sort: ArticleSortData.Published,
                limit,
              },
              false,
            )
          ).items,
        })),
      );

      return groups.filter((group) => group.items.length > 0);
    } catch {
      throw new DependencyError('Failed to load category article groups');
    }
  }

  /**
   * Returns one published article by its slug and records a view.
   * @param slug - Public article slug, unique per article
   * @returns Full article detail
   */
  async getPublishedArticleBySlugService(slug: string): Promise<ArticleDetailData> {
    try {
      const article = await this.articlesRepository.findPublishedArticleBySlugRepository(slug);

      if (!article) {
        throw new NotFoundError('Article', slug);
      }

      // Counting a view must never stop a reader reading. A failure here is
      // logged and swallowed, rather than turning a successful read into a 503.
      try {
        await this.articlesRepository.recordArticleViewRepository(article.id);
        article.viewCount += 1;
      } catch (viewError) {
        this.logger.warn(
          `Failed to record a view for article ${article.id}: ${
            viewError instanceof Error ? viewError.message : 'unknown error'
          }`,
        );
      }

      return article;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      throw new DependencyError('Failed to load the article');
    }
  }

  /**
   * Appends "-2", "-3", ... to a slug until it does not collide with another
   * article. Stories CRUD has no editorial review step, so two Stories with
   * the same headline is routine, not an error the caller should have to
   * handle by hand.
   *
   * @param baseSlug - Slug derived from the caller's input
   * @param excludeId - Article id to ignore, when resolving during an update
   * @returns A slug guaranteed unique at the time of the check
   */
  private async ensureUniqueSlugService(baseSlug: string, excludeId?: string): Promise<string> {
    let candidate = baseSlug;
    let suffix = 2;

    while (await this.articlesRepository.slugExistsRepository(candidate, excludeId)) {
      candidate = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    return candidate;
  }

  /**
   * Returns one article for admin editing without recording a view.
   * @param id - Article id
   * @returns Full article detail
   */
  async getArticleByIdService(id: string): Promise<ArticleDetailData> {
    try {
      const article = await this.articlesRepository.findArticleByIdRepository(id);

      if (!article) {
        throw new NotFoundError('Article', id);
      }

      return article;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      throw new DependencyError('Failed to load the article');
    }
  }

  /**
   * Creates a draft article owned by the authenticated author.
   * @param payload - Create fields from the caller
   * @param author - Authenticated author
   * @returns Created article detail
   */
  async createArticleService(
    payload: {
      headline: string;
      subHeadline?: string | null;
      slug?: string;
      categoryId: string;
      heroImageUrl?: string | null;
      contentHtml?: string;
      tags?: string[];
    },
    author?: AuthorData,
  ): Promise<ArticleDetailData> {
    await this.assertCategoryExistsService(payload.categoryId);

    // Stories CRUD is unauthenticated, so there is usually no session author.
    // Fall back to the newsroom's default byline.
    const resolvedAuthor = author ?? (await this.articlesRepository.findDefaultAuthorRepository());

    if (!resolvedAuthor) {
      throw new ValidationError('No author exists to attribute this Story to');
    }

    const uniqueSlug = await this.ensureUniqueSlugService(toSlugUtil(payload.slug ?? payload.headline));

    try {
      return await this.articlesRepository.createArticleRepository({
        headline: payload.headline.trim(),
        sub_headline: payload.subHeadline?.trim() ?? null,
        slug: uniqueSlug,
        category_id: payload.categoryId,
        author_id: resolvedAuthor.id,
        hero_image_url: payload.heroImageUrl ?? null,
        content_html: sanitizeHtmlUtil(payload.contentHtml ?? ''),
        tags: this.normaliseTags(payload.tags),
      });
    } catch (error) {
      throw this.mapArticleWriteError(error, 'Failed to create the article');
    }
  }

  /**
   * Updates an article while enforcing publishing rules.
   * @param id - Article id
   * @param payload - Partial update fields
   * @returns Updated article detail
   */
  async updateArticleService(
    id: string,
    payload: {
      headline?: string;
      subHeadline?: string | null;
      slug?: string;
      categoryId?: string;
      heroImageUrl?: string | null;
      contentHtml?: string;
      tags?: string[];
      status?: ArticleStatusData;
    },
  ): Promise<ArticleDetailData> {
    const existingArticle = await this.getArticleByIdService(id);

    if (payload.categoryId) {
      await this.assertCategoryExistsService(payload.categoryId);
    }

    if (
      existingArticle.status === ArticleStatusData.Published &&
      payload.slug &&
      toSlugUtil(payload.slug) !== existingArticle.slug
    ) {
      throw new ConflictError('Cannot change the slug of a published article');
    }

    const nextStatus = payload.status ?? existingArticle.status;
    const updatePayload: Record<string, string | string[] | null> = {};

    if (payload.headline !== undefined) updatePayload.headline = payload.headline.trim();
    if (payload.subHeadline !== undefined) updatePayload.sub_headline = payload.subHeadline?.trim() ?? null;
    if (payload.slug !== undefined) {
      updatePayload.slug = await this.ensureUniqueSlugService(toSlugUtil(payload.slug), id);
    }
    if (payload.categoryId !== undefined) updatePayload.category_id = payload.categoryId;
    if (payload.heroImageUrl !== undefined) updatePayload.hero_image_url = payload.heroImageUrl ?? null;
    if (payload.contentHtml !== undefined) updatePayload.content_html = sanitizeHtmlUtil(payload.contentHtml);
    if (payload.tags !== undefined) updatePayload.tags = this.normaliseTags(payload.tags);
    if (payload.status !== undefined) updatePayload.status = payload.status;

    // The current schema requires draft articles to clear published_at, so
    // unpublishing intentionally loses the previous public date.
    if (nextStatus === ArticleStatusData.Published && existingArticle.publishedAt === null) {
      updatePayload.published_at = new Date().toISOString();
    }

    if (nextStatus === ArticleStatusData.Draft) {
      updatePayload.published_at = null;
    }

    try {
      const article = await this.articlesRepository.updateArticleRepository(id, updatePayload);

      if (!article) {
        throw new NotFoundError('Article', id);
      }

      return article;
    } catch (error) {
      if (error instanceof ConflictError || error instanceof NotFoundError) {
        throw error;
      }

      throw this.mapArticleWriteError(error, 'Failed to update the article');
    }
  }

  /**
   * Deletes an article.
   * @param id - Article id
   * @returns Null payload on success
   */
  async deleteArticleService(id: string): Promise<null> {
    try {
      const deleted = await this.articlesRepository.deleteArticleRepository(id);

      if (!deleted) {
        throw new NotFoundError('Article', id);
      }

      return null;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      throw new DependencyError('Failed to delete the article');
    }
  }

  /**
   * Replaces an article's ordered Instagram URLs.
   * @param id - Article id
   * @param urls - Ordered Instagram URLs
   * @returns Stored Instagram post rows
   */
  async updateArticleInstagramService(id: string, urls: string[]): Promise<ArticleInstagramPostData[]> {
    await this.getArticleByIdService(id);

    try {
      return await this.articlesRepository.replaceInstagramPostsRepository(id, urls);
    } catch {
      throw new DependencyError('Failed to update Instagram posts');
    }
  }

  /**
   * Returns similar published articles for the story page.
   * @param id - Current article id
   * @param limit - Max rows to return
   * @returns Similar article list items
   */
  async getSimilarArticlesService(id: string, limit = 3): Promise<ArticleListItemData[]> {
    const article = await this.getPublishedArticleByIdService(id);

    try {
      return await this.articlesRepository.findSimilarArticlesRepository(id, article.category.id, limit);
    } catch {
      throw new DependencyError('Failed to load similar articles');
    }
  }

  /**
   * Returns dashboard totals for article statuses.
   * @returns Count summary by article status
   */
  async getArticleStatsService(): Promise<{ totalArticles: number; publishedArticles: number; draftArticles: number }> {
    try {
      const [totalArticles, publishedArticles, draftArticles] = await Promise.all([
        this.articlesRepository.countAllArticlesRepository(),
        this.articlesRepository.countAllArticlesRepository(ArticleStatusData.Published),
        this.articlesRepository.countAllArticlesRepository(ArticleStatusData.Draft),
      ]);

      return {
        totalArticles,
        publishedArticles,
        draftArticles,
      };
    } catch {
      throw new DependencyError('Failed to load article statistics');
    }
  }

  /**
   * Returns a published article without recording a view.
   * @param id - Article id
   * @returns Published article detail
   */
  private async getPublishedArticleByIdService(id: string): Promise<ArticleDetailData> {
    const article = await this.getArticleByIdService(id);

    if (article.status !== ArticleStatusData.Published) {
      throw new NotFoundError('Article', id);
    }

    return article;
  }

  /**
   * Confirms a category exists before an article references it.
   * @param categoryId - Category id
   * @returns Resolves when the category exists
   */
  private async assertCategoryExistsService(categoryId: string): Promise<void> {
    const categories = await this.categoriesRepository.findAdminCategoriesRepository();
    const categoryExists = categories.some((category) => category.id === categoryId);

    if (!categoryExists) {
      throw new ValidationError('Category does not exist');
    }
  }

  /**
   * Normalises tags by trimming blanks and removing empties.
   * @param tags - Raw tag list from the caller
   * @returns Clean tag list
   */
  private normaliseTags(tags?: string[]): string[] {
    return (tags ?? []).map((tag) => tag.trim()).filter((tag) => tag.length > 0);
  }

  /**
   * Maps repository write failures to client-safe errors.
   * @param error - Unknown repository error
   * @param fallbackMessage - Default message when no richer mapping exists
   * @returns A domain error to throw
   */
  private mapArticleWriteError(error: unknown, fallbackMessage: string): ConflictError | DependencyError {
    if (error instanceof Error && /duplicate key value/i.test(error.message)) {
      return new ConflictError('Article slug conflicts with an existing record');
    }

    return new DependencyError(fallbackMessage);
  }
}
