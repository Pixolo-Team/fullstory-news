// SERVICES //
import { LoginPageClient } from '@/components/login-page-client';

// REQUESTS //
import { getAuthMeRequest } from '@/requests/get-auth-me.request';

// LIBRARIES //
import { redirect } from 'next/navigation';

/**
 * Renders the admin sign-in page.
 */
export default async function LoginPage() {
  const author = await getAuthMeRequest();

  // Already signed in - no reason to show the form again.
  if (author) {
    redirect('/');
  }

  return <LoginPageClient />;
}
