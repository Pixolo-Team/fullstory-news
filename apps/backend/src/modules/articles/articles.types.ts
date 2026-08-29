// TYPES //
import type { CategoryData } from '@/modules/categories/categories.types.js';
import type { AuthorData } from '@/modules/auth/auth.types.js';

/**
 * Article lifecycle states.
 */
export enum ArticleStatusData {
  Draft = 'draft',
  Published = 'published',
}

/**
 * Public/admin article list item.
 */
export interface ArticleListItemData {
  id: string;
  headline: string;
  subHeadline: string | null;
  slug: string;
  status: ArticleStatusData;
  heroImageUrl: string | null;
  tags: string[];
  viewCount: number;
  category: CategoryData;
  author: Pick<AuthorData, 'id' | 'name'>;
  publishedAt: string | null;
  updatedAt: string;
}

/**
 * Stored Instagram URL attached to an article.
 */
export interface ArticleInstagramPostData {
  id: string;
  instagramUrl: string;
  sortOrder: number;
}

/**
 * Full article payload.
 */
export interface ArticleDetailData extends ArticleListItemData {
  contentHtml: string;
  createdAt: string;
  instagramPosts: ArticleInstagramPostData[];
  author: AuthorData;
}

/**
 * Home-page category grouping payload.
 */
export interface ArticleCategoryGroupData {
  category: CategoryData;
  items: ArticleListItemData[];
}

/**
 * Supported article list sort modes.
 */
export enum ArticleSortData {
  Latest = 'latest',
  Published = 'published',
  Views = 'views',
}
