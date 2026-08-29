// TYPES //
import type { ArticleStatusData } from '@/types/api.types';

// SERVICES //
import { StoriesPageClient } from '@/components/stories-page-client';

// REQUESTS //
import { getAdminArticlesRequest } from '@/requests/get-admin-articles.request';

interface StoriesPageProps {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}

/**
 * Renders the Story management page with data from the backend.
 */
export default async function StoriesPage({ searchParams }: StoriesPageProps) {
  const resolvedParams = await searchParams;
  const status = (resolvedParams.status ?? 'all') as ArticleStatusData | 'all';

  const articles = await getAdminArticlesRequest({
    status,
    q: resolvedParams.q,
    page: resolvedParams.page ? Number(resolvedParams.page) : 1,
  });

  return (
    <StoriesPageClient
      articles={articles}
      searchQuery={resolvedParams.q ?? ''}
      statusFilter={status}
    />
  );
}
