'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminDemoContext } from '@/components/admin-demo-provider';

interface DashboardAccessGateProps {
  children: ReactNode;
}

/**
 * Redirects unauthenticated users to the local dummy login screen.
 */
export function DashboardAccessGate({ children }: DashboardAccessGateProps) {
  // Define Navigation
  const router = useRouter();

  // Define Context
  const { isAuthenticated } = useAdminDemoContext();

  // Define Refs

  // Define States

  // Helper Functions

  // Use Effects
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
