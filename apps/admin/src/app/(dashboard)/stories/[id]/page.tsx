import { StoryEditorPageClient } from '@/components/story-editor-page-client';

interface EditStoryPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Renders the Story edit page.
 */
export default async function EditStoryPage({ params }: EditStoryPageProps) {
  const resolvedParams = await params;

  return <StoryEditorPageClient storyId={resolvedParams.id} />;
}
