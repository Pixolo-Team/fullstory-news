/**
 * Publishing states available in the admin panel.
 */
export type StoryStatusData = 'draft' | 'published';

/**
 * Summary metric displayed on the dashboard overview.
 */
export interface DashboardMetricData {
  label: string;
  value: string;
  detail: string;
}

/**
 * Story row displayed in listing views.
 */
export interface StoryListItemData {
  id: string;
  headline: string;
  subHeadline: string;
  slug: string;
  categoryName: string;
  authorName: string;
  status: StoryStatusData;
  updatedAt: string;
  publishedAt: string | null;
  viewCount: string;
  heroImageUrl: string;
  tags: string[];
}

/**
 * Category row displayed in admin lists.
 */
export interface CategoryListItemData {
  id: string;
  name: string;
  slug: string;
  storyCount: number;
  updatedAt: string;
}

/**
 * Form payload used to render the Story editor.
 */
export interface StoryEditorData {
  id: string;
  headline: string;
  subHeadline: string;
  slug: string;
  categoryName: string;
  authorName: string;
  heroImageUrl: string;
  tagsText: string;
  status: StoryStatusData;
  publishedAt: string | null;
  contentHtml: string;
}

/**
 * Combined dashboard payload for the admin home view.
 */
export interface DashboardData {
  metrics: DashboardMetricData[];
  stories: StoryListItemData[];
  categories: CategoryListItemData[];
}
