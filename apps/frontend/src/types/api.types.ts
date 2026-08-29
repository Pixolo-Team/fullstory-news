/** Response envelope returned by every backend endpoint. */
export interface ApiResponseData<T> {
  data: T | null;
  status: 'success' | 'error';
  status_code: number;
  message: string;
  error: string | null;
}

/** Paginated payload returned by list endpoints. */
export interface PaginatedData<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Category used across navigation and listings. */
export interface CategoryData {
  id: string;
  name: string;
  slug: string;
}

/** Author byline. */
export interface AuthorData {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

/** Article as returned by list endpoints. Never carries contentHtml. */
export interface ArticleData {
  id: string;
  headline: string;
  subHeadline: string | null;
  slug: string;
  status: 'draft' | 'published';
  heroImageUrl: string | null;
  tags: string[];
  viewCount: number;
  category: CategoryData;
  author: Pick<AuthorData, 'id' | 'name'>;
  publishedAt: string | null;
  updatedAt: string;
}

/** Instagram post attached to an article. */
export interface ArticleInstagramPostData {
  id: string;
  instagramUrl: string;
  sortOrder: number;
}

/** Full article returned by the detail endpoint. */
export interface ArticleDetailData extends ArticleData {
  contentHtml: string;
  createdAt: string;
  instagramPosts: ArticleInstagramPostData[];
  author: AuthorData;
}

/** One category block on the home page. */
export interface CategoryGroupData {
  category: CategoryData;
  items: ArticleData[];
}
