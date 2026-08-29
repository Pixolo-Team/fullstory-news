/**
 * Shared API response envelope returned by the backend.
 */
export interface ApiResponseData<T> {
  data: T | null;
  status: 'success' | 'error';
  status_code: number;
  message: string;
  error: string | null;
}

/**
 * Shared paginated payload returned by list endpoints.
 */
export interface PaginatedData<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
/**
 * Authenticated admin author payload.
 */
export interface AdminUserData {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

/**
 * Dashboard summary payload.
 */
export interface DashboardStatsData {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalCategories: number;
}

/**
 * Category payload used across the admin app.
 */
export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  articleCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Article status values supported by the backend.
 */
export type ArticleStatusData = 'draft' | 'published';

/**
 * Article listing payload.
 */
export interface ArticleData {
  id: string;
  headline: string;
  subHeadline: string | null;
  slug: string;
  status: ArticleStatusData;
  heroImageUrl: string | null;
  tags: string[];
  viewCount: number;
  category: CategoryData;
  author: Pick<AdminUserData, 'id' | 'name'>;
  publishedAt: string | null;
  updatedAt: string;
}

/**
 * Instagram URL payload attached to an article.
 */
export interface ArticleInstagramPostData {
  id: string;
  instagramUrl: string;
  sortOrder: number;
}

/**
 * Full article payload returned for editing.
 */
export interface ArticleDetailData extends ArticleData {
  contentHtml: string;
  createdAt: string;
  instagramPosts: ArticleInstagramPostData[];
  author: AdminUserData;
}

/**
 * Backend request status shown in admin fallbacks.
 */
export interface BackendStatusData {
  isAvailable: boolean;
  errorMessage: string | null;
}
