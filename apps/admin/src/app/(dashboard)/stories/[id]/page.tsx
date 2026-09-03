// SERVICES //
import { PageHeader } from '@/components/page-header';
import { RequestError } from '@/components/request-error';
import { StoryForm } from '@/components/story-form';

// REQUESTS //
import { getAdminArticleRequest } from '@/requests/get-admin-article.request';
import { getCategoriesRequest } from '@/requests/get-categories.request';

// LIBRARIES //
import { notFound } from 'next/navigation';

interface EditStoryPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Renders the Story edit screen.
 */
export default async function EditStoryPage({ params }: EditStoryPageProps) {
  const resolvedParams = await params;
  const [article, categories] = await Promise.all([
    getAdminArticleRequest(resolvedParams.id),
    getCategoriesRequest(),
  ]);

  if (!article) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader description={`/story/${article.slug}`} title="Edit Story" />

      {categories.errorMessage ? (
        <RequestError message={categories.errorMessage} what="Categories" />
      ) : (
        <StoryForm
          article={article}
          categories={categories.data}
          description="Changes save to the backend immediately."
          title={article.headline}
        />
      )}
    </div>
  );
}
