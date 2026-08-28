import type {
  CategoryListItemData,
  DashboardData,
  DashboardMetricData,
  StoryEditorData,
  StoryListItemData,
  StoryStatusData,
} from '@/types/admin.types';

const DEFAULT_STORY_ITEMS: StoryListItemData[] = [
  {
    id: 'story-1001',
    headline: 'City rail expansion clears its final funding vote',
    subHeadline: 'Construction could begin early next year if land clearances stay on schedule.',
    slug: 'city-rail-expansion-clears-final-funding-vote',
    categoryName: 'Politics',
    authorName: 'Amina Khan',
    status: 'published',
    updatedAt: '2026-08-27 18:10 UTC',
    publishedAt: '2026-08-27 16:30 UTC',
    viewCount: '14,280',
    heroImageUrl: 'https://images.example.com/rail-expansion.jpg',
    tags: ['metro', 'budget', 'state'],
  },
  {
    id: 'story-1002',
    headline: 'Local device makers race to supply lower-cost classroom tablets',
    subHeadline: 'A state procurement push is widening competition beyond the biggest brands.',
    slug: 'local-device-makers-race-to-supply-classroom-tablets',
    categoryName: 'Tech',
    authorName: 'Rohan Shah',
    status: 'draft',
    updatedAt: '2026-08-28 06:45 UTC',
    publishedAt: null,
    viewCount: '0',
    heroImageUrl: 'https://images.example.com/classroom-tablets.jpg',
    tags: ['education', 'hardware', 'manufacturing'],
  },
  {
    id: 'story-1003',
    headline: 'Monsoon recovery lifts reservoir levels across the region',
    subHeadline: 'Officials say supply pressure has eased, though some districts still face restrictions.',
    slug: 'monsoon-recovery-lifts-reservoir-levels',
    categoryName: 'World',
    authorName: 'Sara Thomas',
    status: 'published',
    updatedAt: '2026-08-28 04:20 UTC',
    publishedAt: '2026-08-28 03:00 UTC',
    viewCount: '8,904',
    heroImageUrl: 'https://images.example.com/reservoir-levels.jpg',
    tags: ['weather', 'water', 'policy'],
  },
  {
    id: 'story-1004',
    headline: 'Weekend training block reshapes the national squad selection',
    subHeadline: 'Coaches want more flexibility before naming the final tournament list.',
    slug: 'weekend-training-block-reshapes-squad-selection',
    categoryName: 'Sports',
    authorName: 'Daniel Roy',
    status: 'draft',
    updatedAt: '2026-08-27 13:05 UTC',
    publishedAt: null,
    viewCount: '0',
    heroImageUrl: 'https://images.example.com/squad-selection.jpg',
    tags: ['team', 'selection', 'tournament'],
  },
];

const DEFAULT_CATEGORY_ITEMS: CategoryListItemData[] = [
  {
    id: 'category-1',
    name: 'World',
    slug: 'world',
    storyCount: 18,
    updatedAt: '2026-08-27 11:10 UTC',
  },
  {
    id: 'category-2',
    name: 'Tech',
    slug: 'tech',
    storyCount: 11,
    updatedAt: '2026-08-26 09:55 UTC',
  },
  {
    id: 'category-3',
    name: 'Politics',
    slug: 'politics',
    storyCount: 24,
    updatedAt: '2026-08-28 05:35 UTC',
  },
  {
    id: 'category-4',
    name: 'Sports',
    slug: 'sports',
    storyCount: 9,
    updatedAt: '2026-08-25 18:40 UTC',
  },
];

/**
 * Maps a story status to the badge variant used across the admin UI.
 */
export function getStoryStatusVariantService(
  status: StoryStatusData,
): 'default' | 'secondary' {
  return status === 'published' ? 'default' : 'secondary';
}

/**
 * Returns the default Story dataset for the local dummy admin experience.
 */
export function getDefaultStoriesDataService(): StoryListItemData[] {
  return DEFAULT_STORY_ITEMS.map((story) => ({ ...story, tags: [...story.tags] }));
}

/**
 * Returns the default Category dataset for the local dummy admin experience.
 */
export function getDefaultCategoriesDataService(): CategoryListItemData[] {
  return DEFAULT_CATEGORY_ITEMS.map((category) => ({ ...category }));
}

/**
 * Builds dashboard metrics and summaries from the current local demo state.
 */
export function getDashboardDataService(
  stories: StoryListItemData[],
  categories: CategoryListItemData[],
): DashboardData {
  const publishedCount = stories.filter((story) => story.status === 'published').length;
  const draftCount = stories.length - publishedCount;

  const metrics: DashboardMetricData[] = [
    {
      label: 'Total stories',
      value: String(stories.length),
      detail: 'Published and draft Stories in the current workspace preview.',
    },
    {
      label: 'Published',
      value: String(publishedCount),
      detail: 'Stories that would appear on the public site.',
    },
    {
      label: 'Drafts',
      value: String(draftCount),
      detail: 'Stories still being edited before publication.',
    },
    {
      label: 'Categories',
      value: String(categories.length),
      detail: 'Navigation categories configured for the public site.',
    },
  ];

  return {
    metrics,
    stories: stories.slice(0, 4),
    categories: categories.slice(0, 4),
  };
}

/**
 * Returns Story editor data for a new or existing Story route.
 */
export function getStoryEditorDataService(
  id: string,
  stories: StoryListItemData[],
): StoryEditorData {
  const matchingStory = stories.find((story) => story.id === id);

  if (!matchingStory) {
    return {
      id: 'new-story',
      headline: '',
      subHeadline: '',
      slug: '',
      categoryName: 'World',
      authorName: 'Amina Khan',
      heroImageUrl: '',
      tagsText: '',
      status: 'draft',
      publishedAt: null,
      contentHtml:
        '<p>Write the Story body here. This temporary textarea stands in for the eventual rich text editor.</p>',
    };
  }

  return {
    id: matchingStory.id,
    headline: matchingStory.headline,
    subHeadline: matchingStory.subHeadline,
    slug: matchingStory.slug,
    categoryName: matchingStory.categoryName,
    authorName: matchingStory.authorName,
    heroImageUrl: matchingStory.heroImageUrl,
    tagsText: matchingStory.tags.join(', '),
    status: matchingStory.status,
    publishedAt: matchingStory.publishedAt,
    contentHtml: `<p>${matchingStory.subHeadline}</p>\n<p>This screen uses dummy content so we can review the admin workflow before wiring the real API.</p>`,
  };
}

/**
 * Creates a URL-friendly slug from a Story or Category name.
 */
export function getSlugPreviewService(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Returns the display timestamp for the current local edit.
 */
export function getCurrentAdminTimestampService(): string {
  const currentDate = new Date();
  const isoStamp = currentDate.toISOString().replace('T', ' ').slice(0, 16);

  return `${isoStamp} UTC`;
}
