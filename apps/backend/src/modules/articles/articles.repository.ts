// TYPES //
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuthorData } from '@/modules/auth/auth.types.js';
import type {
  ArticleDetailData,
  ArticleInstagramPostData,
  ArticleListItemData,
  ArticleStatusData,
} from '@/modules/articles/articles.types.js';

// CONFIG //
import { SUPABASE_CLIENT } from '@/config/supabase.config.js';

// LIBRARIES //
import { Inject, Injectable } from '@nestjs/common';

/** Raw category join row. */
interface CategoryJoinRowData {
  id: string;
  name: string;
  slug: string;
}

/** Raw author join row. */
interface AuthorJoinRowData {
  id: string;
  name: string;
  email?: string;
  avatar_url?: string | null;
}

/** Raw article query row. */
interface ArticleRowData {
  id: string;
  headline: string;
  sub_headline: string | null;
  slug: string;
  status: ArticleStatusData;
  hero_image_url: string | null;
  content_html?: string;
  tags: string[];
  view_count: number;
  published_at: string | null;
  created_at?: string;
  updated_at: string;
  category: CategoryJoinRowData;
  author: AuthorJoinRowData;
}

/** Raw instagram row. */
interface InstagramRowData {
  id: string;
  instagram_url: string;
  sort_order: number;
}

/**
 * Data access for articles.
 */
@Injectable()
export class ArticlesRepository {
  constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

  /**
   * Lists articles matching the supplied filters.
   * @param query - Article filters
   * @param includeDrafts - Whether draft rows may be returned
   * @returns Matching article list items
   */
  async findArticlesRepository(
    query: {
      category?: string;
      sort?: string;
      status?: string;
      q?: string;
      page: number;
      limit: number;
    },
    includeDrafts: boolean,
  ): Promise<ArticleListItemData[]> {
    let request = this.supabase
      .from('articles')
      .select(
        'id, headline, sub_headline, slug, status, hero_image_url, tags, view_count, published_at, updated_at, category:categories!inner(id, name, slug), author:authors!inner(id, name)',
      )
      .range((query.page - 1) * query.limit, query.page * query.limit - 1);

    if (query.category) {
      request = request.eq('categories.slug', query.category);
    }

    if (!includeDrafts) {
      request = request.eq('status', 'published');
    } else if (query.status && query.status !== 'all') {
      request = request.eq('status', query.status);
    }

    if (query.q) {
      request = request.or(
        `headline.ilike.%${query.q}%,sub_headline.ilike.%${query.q}%,content_html.ilike.%${query.q}%`,
      );
    }

    request = this.applySort(request, query.sort);

    const { data, error } = await request.returns<ArticleRowData[]>();

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map((row) => this.mapArticleListItem(row));
  }

  /**
   * Counts articles matching the supplied filters.
   * @param query - Article filters
   * @param includeDrafts - Whether draft rows may be counted
   * @returns Matching article count
   */
  async countArticlesRepository(
    query: {
      category?: string;
      status?: string;
      q?: string;
    },
    includeDrafts: boolean,
  ): Promise<number> {
    let request = this.supabase
      .from('articles')
      .select('id, categories!inner(slug)', { count: 'exact', head: true });

    if (query.category) {
      request = request.eq('categories.slug', query.category);
    }

    if (!includeDrafts) {
      request = request.eq('status', 'published');
    } else if (query.status && query.status !== 'all') {
      request = request.eq('status', query.status);
    }

    if (query.q) {
      request = request.or(
        `headline.ilike.%${query.q}%,sub_headline.ilike.%${query.q}%,content_html.ilike.%${query.q}%`,
      );
    }

    const { count, error } = await request;

    if (error) {
      throw new Error(error.message);
    }

    return count ?? 0;
  }

  /**
   * Reads one published article by slug and id.
   * @param slug - Public slug
   * @param id - Article id
   * @returns Full article when found
   */
  async findPublishedArticleBySlugRepository(slug: string, id: string): Promise<ArticleDetailData | null> {
    const { data, error } = await this.supabase
      .from('articles')
      .select(
        'id, headline, sub_headline, slug, status, hero_image_url, content_html, tags, view_count, published_at, created_at, updated_at, category:categories(id, name, slug), author:authors(id, name, email, avatar_url)',
      )
      .eq('id', id)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle<ArticleRowData>();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    return this.mapArticleDetail(data, await this.findInstagramPostsByArticleIdRepository(id));
  }

  /**
   * Reads one article by id without recording a view.
   * @param id - Article id
   * @returns Full article when found
   */
  async findArticleByIdRepository(id: string): Promise<ArticleDetailData | null> {
    const { data, error } = await this.supabase
      .from('articles')
      .select(
        'id, headline, sub_headline, slug, status, hero_image_url, content_html, tags, view_count, published_at, created_at, updated_at, category:categories(id, name, slug), author:authors(id, name, email, avatar_url)',
      )
      .eq('id', id)
      .maybeSingle<ArticleRowData>();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    return this.mapArticleDetail(data, await this.findInstagramPostsByArticleIdRepository(id));
  }

  /**
   * Creates an article row.
   * @param payload - Article fields to store
   * @returns The created article detail
   */
  async createArticleRepository(payload: {
    headline: string;
    sub_headline: string | null;
    slug: string;
    category_id: string;
    author_id: string;
    hero_image_url: string | null;
    content_html: string;
    tags: string[];
  }): Promise<ArticleDetailData> {
    const { data, error } = await this.supabase
      .from('articles')
      .insert(payload)
      .select(
        'id, headline, sub_headline, slug, status, hero_image_url, content_html, tags, view_count, published_at, created_at, updated_at, category:categories(id, name, slug), author:authors(id, name, email, avatar_url)',
      )
      .single<ArticleRowData>();

    if (error) {
      throw new Error(error.message);
    }

    return this.mapArticleDetail(data, []);
  }

  /**
   * Updates an article row.
   * @param id - Article id
   * @param payload - Partial article fields to update
   * @returns Updated article detail when found
   */
  async updateArticleRepository(
    id: string,
    payload: Record<string, string | string[] | null>,
  ): Promise<ArticleDetailData | null> {
    const { data, error } = await this.supabase
      .from('articles')
      .update(payload)
      .eq('id', id)
      .select(
        'id, headline, sub_headline, slug, status, hero_image_url, content_html, tags, view_count, published_at, created_at, updated_at, category:categories(id, name, slug), author:authors(id, name, email, avatar_url)',
      )
      .maybeSingle<ArticleRowData>();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    return this.mapArticleDetail(data, await this.findInstagramPostsByArticleIdRepository(id));
  }

  /**
   * Deletes an article row.
   * @param id - Article id
   * @returns True when a row was deleted
   */
  async deleteArticleRepository(id: string): Promise<boolean> {
    const { error, count } = await this.supabase.from('articles').delete({ count: 'exact' }).eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return (count ?? 0) > 0;
  }

  /**
   * Replaces the ordered Instagram URLs attached to an article.
   * @param articleId - Article id
   * @param urls - Ordered Instagram URLs
   * @returns Persisted Instagram post rows
   */
  async replaceInstagramPostsRepository(articleId: string, urls: string[]): Promise<ArticleInstagramPostData[]> {
    const deleteResult = await this.supabase.from('article_instagram_post').delete().eq('article_id', articleId);

    if (deleteResult.error) {
      throw new Error(deleteResult.error.message);
    }

    if (urls.length === 0) {
      return [];
    }

    const { data, error } = await this.supabase
      .from('article_instagram_post')
      .insert(
        urls.map((url, index) => ({
          article_id: articleId,
          instagram_url: url,
          sort_order: index,
        })),
      )
      .select('id, instagram_url, sort_order')
      .order('sort_order', { ascending: true })
      .returns<InstagramRowData[]>();

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map((row) => this.mapInstagramRow(row));
  }

  /**
   * Reads Instagram URLs attached to an article.
   * @param articleId - Article id
   * @returns Ordered Instagram URL rows
   */
  async findInstagramPostsByArticleIdRepository(articleId: string): Promise<ArticleInstagramPostData[]> {
    const { data, error } = await this.supabase
      .from('article_instagram_post')
      .select('id, instagram_url, sort_order')
      .eq('article_id', articleId)
      .order('sort_order', { ascending: true })
      .returns<InstagramRowData[]>();

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map((row) => this.mapInstagramRow(row));
  }

  /**
   * Returns the author a Story is attributed to when the caller supplies none.
   *
   * Stories CRUD is unauthenticated, so there is no session to read an author
   * from. The oldest author row stands in as the newsroom byline.
   *
   * @returns The oldest author row, or null when the table is empty
   */
  async findDefaultAuthorRepository(): Promise<AuthorData | null> {
    const { data, error } = await this.supabase
      .from('authors')
      .select('id, name, email, avatar_url')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle<{ id: string; name: string; email: string; avatar_url: string | null }>();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      avatarUrl: data.avatar_url,
    };
  }

  /**
   * Records an article view and increments the lifetime counter.
   * @param articleId - Article id
   * @returns Resolves once both writes complete
   */
  async recordArticleViewRepository(articleId: string): Promise<void> {
    // Both writes go through one RPC so the timestamped row and the lifetime
    // counter cannot diverge, and the counter is incremented in SQL rather
    // than read-modify-written here - concurrent readers of the same Story
    // would otherwise overwrite each other and lose views.
    const { error } = await this.supabase.rpc('record_article_view', {
      target_article_id: articleId,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Reads recent article views for trending calculation.
   * @param viewedAfter - ISO timestamp lower bound
   * @returns View rows within the rolling window
   */
  async findRecentArticleViewsRepository(viewedAfter: string): Promise<{ articleId: string }[]> {
    const { data, error } = await this.supabase
      .from('article_views')
      .select('article_id')
      .gte('viewed_at', viewedAfter)
      .returns<Array<{ article_id: string }>>();

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map((row) => ({ articleId: row.article_id }));
  }

  /**
   * Reads a set of articles by id.
   * @param ids - Article ids
   * @returns Matching article list items
   */
  async findArticlesByIdsRepository(ids: string[]): Promise<ArticleListItemData[]> {
    if (ids.length === 0) {
      return [];
    }

    const { data, error } = await this.supabase
      .from('articles')
      .select(
        'id, headline, sub_headline, slug, status, hero_image_url, tags, view_count, published_at, updated_at, category:categories!inner(id, name, slug), author:authors!inner(id, name)',
      )
      .in('id', ids)
      .returns<ArticleRowData[]>();

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map((row) => this.mapArticleListItem(row));
  }

  /**
   * Reads similar published articles from the same category.
   * @param articleId - Current article id
   * @param categoryId - Current article category id
   * @param limit - Max rows to return
   * @returns Similar article list items
   */
  async findSimilarArticlesRepository(
    articleId: string,
    categoryId: string,
    limit: number,
  ): Promise<ArticleListItemData[]> {
    const { data, error } = await this.supabase
      .from('articles')
      .select(
        'id, headline, sub_headline, slug, status, hero_image_url, tags, view_count, published_at, updated_at, category:categories!inner(id, name, slug), author:authors!inner(id, name)',
      )
      .eq('category_id', categoryId)
      .eq('status', 'published')
      .neq('id', articleId)
      .order('published_at', { ascending: false })
      .limit(limit)
      .returns<ArticleRowData[]>();

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map((row) => this.mapArticleListItem(row));
  }

  /**
   * Counts all articles for dashboard totals.
   * @param status - Optional status filter
   * @returns Matching article count
   */
  async countAllArticlesRepository(status?: ArticleStatusData): Promise<number> {
    let request = this.supabase.from('articles').select('id', { count: 'exact', head: true });

    if (status) {
      request = request.eq('status', status);
    }

    const { count, error } = await request;

    if (error) {
      throw new Error(error.message);
    }

    return count ?? 0;
  }

  /**
   * Applies the requested ordering to an article list query.
   * @param request - In-progress Supabase query
   * @param sort - Requested sort mode
   * @returns Sorted query builder
   */
  private applySort(
    request: ReturnType<SupabaseClient['from']> extends infer T ? any : never,
    sort?: string,
  ) {
    if (sort === 'views') {
      return request.order('view_count', { ascending: false });
    }

    if (sort === 'published') {
      return request.order('published_at', { ascending: false, nullsFirst: false });
    }

    return request.order('updated_at', { ascending: false });
  }

  /**
   * Maps a raw article row to the list payload.
   * @param row - Raw article row
   * @returns List payload
   */
  private mapArticleListItem(row: ArticleRowData): ArticleListItemData {
    return {
      id: row.id,
      headline: row.headline,
      subHeadline: row.sub_headline,
      slug: row.slug,
      status: row.status,
      heroImageUrl: row.hero_image_url,
      tags: row.tags ?? [],
      viewCount: row.view_count,
      category: {
        id: row.category.id,
        name: row.category.name,
        slug: row.category.slug,
      },
      author: {
        id: row.author.id,
        name: row.author.name,
      },
      publishedAt: row.published_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Maps a raw article row to the detail payload.
   * @param row - Raw article row
   * @param instagramPosts - Ordered Instagram URLs for the article
   * @returns Detail payload
   */
  private mapArticleDetail(
    row: ArticleRowData,
    instagramPosts: ArticleInstagramPostData[],
  ): ArticleDetailData {
    return {
      ...this.mapArticleListItem(row),
      contentHtml: row.content_html ?? '',
      createdAt: row.created_at ?? row.updated_at,
      instagramPosts,
      author: {
        id: row.author.id,
        name: row.author.name,
        email: row.author.email ?? '',
        avatarUrl: row.author.avatar_url ?? null,
      },
    };
  }

  /**
   * Maps a raw Instagram row to the API payload.
   * @param row - Raw Instagram row
   * @returns Normalised Instagram post data
   */
  private mapInstagramRow(row: InstagramRowData): ArticleInstagramPostData {
    return {
      id: row.id,
      instagramUrl: row.instagram_url,
      sortOrder: row.sort_order,
    };
  }
}
