// SERVICES //
import { CategoriesPageClient } from '@/components/categories-page-client';
import { RequestError } from '@/components/request-error';

// REQUESTS //
import { getAdminCategoriesRequest } from '@/requests/get-admin-categories.request';

/**
 * Renders the Category management page with data from the backend.
 */
export default async function CategoriesPage() {
  const categories = await getAdminCategoriesRequest();

  if (categories.errorMessage) {
    return <RequestError message={categories.errorMessage} what="Categories" />;
  }

  return <CategoriesPageClient categories={categories.data} />;
}
