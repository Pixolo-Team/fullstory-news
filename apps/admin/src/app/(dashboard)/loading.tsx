// SERVICES //
import { AdminRouteLoading } from '@/components/admin-route-loading';

/**
 * Renders the fallback UI while dashboard routes load fresh data.
 */
export default function DashboardLoading() {
  return (
    <AdminRouteLoading
      description="Fresh Stories, Categories, and dashboard data are on the way."
      title="workspace"
    />
  );
}
