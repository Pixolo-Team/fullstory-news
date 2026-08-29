'use client';

import Link from 'next/link';
import { useAdminDemoContext } from '@/components/admin-demo-provider';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getStoryStatusVariantService } from '@/services/get-admin-demo-data.service';

interface StoryPreviewPageClientProps {
  storyId: string;
}

/**
 * Renders a local Story preview page from the dummy admin store.
 */
export function StoryPreviewPageClient({ storyId }: StoryPreviewPageClientProps) {
  // Define Navigation

  // Define Context
  const { stories } = useAdminDemoContext();

  // Define Refs

  // Define States

  // Helper Functions
  const story = stories.find((currentStory) => currentStory.id === storyId);

  // Use Effects
  if (!story) {
    return (
      <div className="space-y-6">
        <PageHeader description="This Story is no longer available in the local preview store." title="Preview unavailable" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Link href={`/stories/${story.id}`}>
            <Button variant="outline">Back to editor</Button>
          </Link>
        }
        description="A local preview of the current saved dummy Story."
        title="Story Preview"
      />

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={getStoryStatusVariantService(story.status)}>{story.status}</Badge>
            <span className="text-sm text-ink-muted">{story.categoryName}</span>
            <span className="text-sm text-ink-muted">{story.authorName}</span>
          </div>
          <div className="space-y-2">
            <p className="admin-kicker">/{story.slug}</p>
            <CardTitle className="text-3xl">{story.headline}</CardTitle>
            <p className="text-base leading-7 text-ink-muted">{story.subHeadline}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-2xl border border-rule bg-paper-muted p-4 text-sm text-ink-muted">
            Hero image URL: {story.heroImageUrl || 'No hero image selected'}
          </div>
          <div className="space-y-3">
            <p className="admin-kicker">Body</p>
            <div className="rounded-2xl border border-rule bg-paper p-5">
              <p className="leading-7 text-ink-muted">{story.subHeadline}</p>
              <p className="mt-4 leading-7 text-ink-muted">
                This local preview mirrors the saved dummy Story data used by the admin panel.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="admin-kicker">Tags</p>
            <div className="flex flex-wrap gap-2">
              {story.tags.map((tag) => (
                <span className="rounded-full border border-rule px-3 py-1 text-sm text-ink-muted" key={tag}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
