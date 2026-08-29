/**
 * Public category payload.
 */
export interface CategoryData {
  id: string;
  name: string;
  slug: string;
}

/**
 * Admin category payload.
 */
export interface AdminCategoryData extends CategoryData {
  articleCount: number;
  createdAt: string;
  updatedAt: string;
}
