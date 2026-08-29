import type { ReactNode } from 'react';
import { DashboardSidebar } from '@/components/dashboard-sidebar';

interface DashboardShellProps {
  children: ReactNode;
}

/**
 * Wraps dashboard pages in the shared admin navigation shell.
 */
export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="admin-app-shell min-h-screen bg-paper-muted">
      <div className="grid min-h-screen lg:h-screen lg:grid-cols-[248px_minmax(0,1fr)]">
        <DashboardSidebar />

        <main className="admin-main-scroll px-5 py-6 sm:px-6 lg:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
