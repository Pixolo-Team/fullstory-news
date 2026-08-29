// TYPES //
import type { DashboardStatsData } from '@/types/api.types';
import type { RequestResultData } from '@/types/request-result.types';

// SERVICES //
import { sendBackendRequest } from '@/requests/backend.request';

/** Zeroed counts, used only alongside an error message. */
const EMPTY_STATS: DashboardStatsData = {
  totalArticles: 0,
  publishedArticles: 0,
  draftArticles: 0,
  totalCategories: 0,
};

/**
 * Fetches dashboard summary counts.
 *
 * Returns an error message rather than null: a failed read used to render as
 * four zeroes, which is indistinguishable from an empty newsroom.
 *
 * @returns Dashboard stats, or an error message when the read failed
 */
export async function getDashboardStatsRequest(): Promise<RequestResultData<DashboardStatsData>> {
  const payload = await sendBackendRequest<DashboardStatsData>('/api/admin/stats');

  if (payload.status === 'error' || payload.data === null) {
    return { data: EMPTY_STATS, errorMessage: payload.message };
  }

  return { data: payload.data, errorMessage: null };
}
