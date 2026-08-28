'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminDemoContext } from '@/components/admin-demo-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Renders the local dummy login flow for the admin panel.
 */
export function LoginPageClient() {
  // Define Navigation
  const router = useRouter();

  // Define Context
  const { isAuthenticated, signIn } = useAdminDemoContext();

  // Define Refs

  // Define States

  // Helper Functions
  /**
   * Signs in to the local dummy admin and opens the dashboard.
   */
  const handleSignIn = (): void => {
    signIn();
    router.push('/');
  };

  // Use Effects
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  return (
    <main className="min-h-screen bg-paper-muted px-4 py-10">
      <div className="mx-auto flex w-full max-w-5xl justify-end pb-6">
        <ThemeToggle />
      </div>
      <div className="flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign in to Full Story</CardTitle>
            <CardDescription>
              This local dummy login unlocks the admin routes so the full preview flow works end to end.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input defaultValue="editor@fullstory.example" id="email" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input defaultValue="password123" id="password" type="password" />
              </div>
            </div>

            <div className="grid gap-3">
              <Button onClick={handleSignIn}>Sign in</Button>
              <Link className="text-center text-sm text-accent underline-offset-4 hover:underline" href="/">
                Open dashboard preview
              </Link>
            </div>

            <div className="rounded-lg border border-rule bg-paper-muted p-4 text-sm text-ink-muted">
              Credentials are placeholders. Sign in stores a local dummy session only.
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
