import type { ReactNode } from 'react';
import { DashboardAccessGate } from '@/components/dashboard-access-gate';
import { DashboardShell } from '@/components/dashboard-shell';

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Wraps dashboard routes in the shared admin shell.
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <DashboardAccessGate>
      <DashboardShell>{children}</DashboardShell>
    </DashboardAccessGate>
  );
}
