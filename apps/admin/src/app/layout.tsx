import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ToastProvider } from '@/components/ui/toast';
import './globals.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Full Story Admin',
  description: 'Admin panel preview for managing Stories and Categories.',
  robots: { index: false, follow: false },
};

interface RootLayoutProps {
  children: ReactNode;
}

/**
 * Wraps the admin application with global metadata and styles.
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-paper text-ink antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
