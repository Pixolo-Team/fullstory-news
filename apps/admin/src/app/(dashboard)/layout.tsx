// TYPES //
import type { ReactNode } from 'react';

// SERVICES //
import { DashboardShell } from '@/components/dashboard-shell';

// REQUESTS //
import { getAuthMeRequest } from '@/requests/get-auth-me.request';

// LIBRARIES //
import { redirect } from 'next/navigation';

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Wraps dashboard routes in the shared admin shell.
 *
 * Access is checked here rather than in middleware: this asks the backend
 * whether the session is valid, where middleware could only see that a cookie
 * existed. It still runs on the server, so nothing renders before the
 * redirect.
 */
export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const author = await getAuthMeRequest();

  if (!author) {
    redirect('/login');
  }

  return <DashboardShell>{children}</DashboardShell>;
}
