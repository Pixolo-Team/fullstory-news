import { StoryPreviewPageClient } from '@/components/story-preview-page-client';

interface StoryPreviewPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Renders the local Story preview page.
 */
export default async function StoryPreviewPage({ params }: StoryPreviewPageProps) {
  const resolvedParams = await params;

  return <StoryPreviewPageClient storyId={resolvedParams.id} />;
}
