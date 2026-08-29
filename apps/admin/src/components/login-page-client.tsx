'use client';

// SERVICES //
import { loginAction } from '@/app/actions/auth.actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// LIBRARIES //
import { useActionState } from 'react';

const INITIAL_LOGIN_STATE = { errorMessage: null as string | null };

/**
 * Renders the admin sign-in form backed by Supabase Auth.
 */
export function LoginPageClient() {
  // Define Navigation

  // Define Context

  // Define Refs

  // Define States
  const [loginState, submitLogin, isSubmitting] = useActionState(loginAction, INITIAL_LOGIN_STATE);

  // Helper Functions

  // Use Effects

  return (
    <main className="min-h-screen bg-paper-muted px-4 py-10">
      <div className="flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign in to Full Story</CardTitle>
            <CardDescription>Use the admin email and password for this project.</CardDescription>
          </CardHeader>

          <CardContent>
            <form action={submitLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input autoComplete="email" id="email" name="email" required type="email" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    autoComplete="current-password"
                    id="password"
                    name="password"
                    required
                    type="password"
                  />
                </div>
              </div>

              {loginState.errorMessage ? (
                <p className="text-sm text-danger" role="alert">
                  {loginState.errorMessage}
                </p>
              ) : null}

              <Button className="w-full" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
