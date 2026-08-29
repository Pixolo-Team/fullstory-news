// SERVICES //
import { PageHeader } from '@/components/page-header';
import { StoryForm } from '@/components/story-form';

// REQUESTS //
import { getCategoriesRequest } from '@/requests/get-categories.request';

/**
 * Renders the create Story screen.
 */
export default async function NewStoryPage() {
  const categories = await getCategoriesRequest();

  return (
    <div className="space-y-6">
      <PageHeader
        description="Every Story starts as a draft. Publish when it is ready."
        title="New Story"
      />

      <StoryForm
        article={null}
        categories={categories.data}
        categoryErrorMessage={categories.errorMessage}
        description="Fill in the headline and body, then save a draft."
        title="Create Story"
      />
    </div>
  );
}
