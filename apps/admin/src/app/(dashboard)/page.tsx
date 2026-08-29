// SERVICES //
import { DashboardPageClient } from '@/components/dashboard-page-client';
import { RequestError } from '@/components/request-error';

// REQUESTS //
import { getAdminArticlesRequest } from '@/requests/get-admin-articles.request';
import { getDashboardStatsRequest } from '@/requests/get-dashboard-stats.request';

/**
 * Renders the admin dashboard overview.
 */
export default async function DashboardPage() {
  const [stats, recent] = await Promise.all([
    getDashboardStatsRequest(),
    getAdminArticlesRequest({ status: 'all', limit: 5 }),
  ]);

  if (stats.errorMessage) {
    return <RequestError message={stats.errorMessage} what="the dashboard" />;
  }

  return <DashboardPageClient recentArticles={recent.items} stats={stats.data} />;
}
