'use client';

import { useRouter } from 'next/navigation';
import { useAdminDemoContext } from '@/components/admin-demo-provider';
import { PageHeader } from '@/components/page-header';
import { StoryForm } from '@/components/story-form';
import { getStoryEditorDataService } from '@/services/get-admin-demo-data.service';
import type { StoryEditorData, StoryStatusData } from '@/types/admin.types';

interface StoryEditorPageClientProps {
  storyId?: string;
}

/**
 * Renders the create/edit Story screen with working local dummy actions.
 */
export function StoryEditorPageClient({ storyId }: StoryEditorPageClientProps) {
  // Define Navigation
  const router = useRouter();

  // Define Context
  const { stories, createStory, updateStory } = useAdminDemoContext();

  // Define Refs

  // Define States

  // Helper Functions
  const isEditingStory = Boolean(storyId);
  const story = getStoryEditorDataService(storyId ?? 'new', stories);
  const storyExists = isEditingStory ? stories.some((currentStory) => currentStory.id === storyId) : true;

  /**
   * Saves the Story and returns to the Stories list.
   */
  const handleSaveStory = (nextStory: StoryEditorData, nextStatus: StoryStatusData): void => {
    if (isEditingStory && storyId) {
      updateStory(storyId, nextStory, nextStatus);
    } else {
      createStory(nextStory, nextStatus);
    }

    router.push('/stories');
  };

  // Use Effects
  if (!storyExists) {
    return (
      <div className="space-y-6">
        <PageHeader
          description="The requested Story no longer exists in the local dummy data."
          title="Story not found"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description={
          isEditingStory
            ? 'Review the edit flow, field grouping, and the published-story slug warning before we connect real data.'
            : 'A first draft flow with the fields, labels, and publishing structure we already know we need.'
        }
        title={isEditingStory ? 'Edit Story' : 'New Story'}
      />
      <StoryForm
        description={
          isEditingStory
            ? 'Dummy content gives us a realistic sense of spacing and editorial density.'
            : 'This preview uses a simple textarea for body content until the editor decision is finalized.'
        }
        onSaveStory={handleSaveStory}
        story={story}
        title={isEditingStory ? story.headline : 'Create Story'}
      />
    </div>
  );
}
