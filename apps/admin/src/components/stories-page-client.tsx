'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminDemoContext } from '@/components/admin-demo-provider';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { getStoryStatusVariantService } from '@/services/get-admin-demo-data.service';

/**
 * Renders Stories with working local add, edit, and delete actions.
 */
export function StoriesPageClient() {
  // Define Navigation

  // Define Context
  const { stories, deleteStory } = useAdminDemoContext();

  // Define Refs

  // Define States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('latest');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Helper Functions
  const publishedCount = stories.filter((story) => story.status === 'published').length;
  const draftCount = stories.length - publishedCount;
  const filteredStories = stories
    .filter((story) => {
      const normalizedQuery = searchQuery.trim().toLowerCase();
      const matchesQuery =
        normalizedQuery.length === 0 ||
        story.headline.toLowerCase().includes(normalizedQuery) ||
        story.slug.toLowerCase().includes(normalizedQuery) ||
        story.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));
      const matchesStatus = statusFilter === 'all' || story.status === statusFilter;

      return matchesQuery && matchesStatus;
    })
    .sort((firstStory, secondStory) => {
      if (sortOrder === 'views') {
        return Number(secondStory.viewCount.replace(/,/g, '')) - Number(firstStory.viewCount.replace(/,/g, ''));
      }

      if (sortOrder === 'published') {
        return (secondStory.publishedAt ?? '').localeCompare(firstStory.publishedAt ?? '');
      }

      return secondStory.updatedAt.localeCompare(firstStory.updatedAt);
    });

  /**
   * Opens the delete confirmation for a Story.
   */
  const handleRequestDeleteStory = (id: string): void => {
    setPendingDeleteId(id);
  };

  /**
   * Closes the delete confirmation without deleting.
   */
  const handleCancelDeleteStory = (): void => {
    setPendingDeleteId(null);
  };

  /**
   * Deletes the Story the confirmation is open for.
   */
  const handleConfirmDeleteStory = (): void => {
    if (!pendingDeleteId) {
      return;
    }

    deleteStory(pendingDeleteId);
    setPendingDeleteId(null);
  };

  const pendingDeleteStory = stories.find((story) => story.id === pendingDeleteId) ?? null;

  // Use Effects
  return (
    <div className="space-y-8">
      <PageHeader
        actions={
          <Link href="/stories/new">
            <Button>New Story</Button>
          </Link>
        }
        description="Review headline hierarchy, status labeling, and the actions editors need most often."
        title="Stories"
      />

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="admin-metric-card">
          <CardContent className="py-6">
            <div>
              <p className="admin-kicker">All Stories</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-ink">{stories.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="admin-metric-card">
          <CardContent className="py-6">
            <div>
              <p className="admin-kicker">Published</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-ink">{publishedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="admin-metric-card">
          <CardContent className="py-6">
            <div>
              <p className="admin-kicker">Drafts</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-ink">{draftCount}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="flex flex-col gap-4 border-b border-rule lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="admin-kicker">Manage</p>
            <CardTitle>Story list</CardTitle>
            <CardDescription>
              Filter controls are still visual-only, but create, edit, and delete now work on the dummy data.
            </CardDescription>
          </div>
          <div className="rounded-full border border-rule bg-paper-muted px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
            {filteredStories.length} items
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px_200px]">
            <Input onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search by headline, slug, or tag" value={searchQuery} />
            <Select onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </Select>
            <Select onChange={(event) => setSortOrder(event.target.value)} value={sortOrder}>
              <option value="latest">Latest update</option>
              <option value="published">Published date</option>
              <option value="views">Most viewed</option>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr className="text-left text-sm text-ink-muted">
                  <th className="border-b border-rule px-4 py-3 font-medium">Story</th>
                  <th className="border-b border-rule px-4 py-3 font-medium">Category</th>
                  <th className="border-b border-rule px-4 py-3 font-medium">Status</th>
                  <th className="border-b border-rule px-4 py-3 font-medium">Updated</th>
                  <th className="border-b border-rule px-4 py-3 font-medium">Views</th>
                  <th className="border-b border-rule px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStories.map((story) => (
                  <tr className="align-top" key={story.id}>
                    <td className="border-b border-rule px-4 py-5">
                      <div className="space-y-1">
                        <p className="text-base font-semibold text-ink">{story.headline}</p>
                        <p className="max-w-2xl text-sm leading-6 text-ink-muted">{story.subHeadline}</p>
                        <p className="text-xs uppercase tracking-[0.12em] text-ink-muted">/{story.slug}</p>
                      </div>
                    </td>
                    <td className="border-b border-rule px-4 py-5 text-sm font-medium text-ink">
                      {story.categoryName}
                    </td>
                    <td className="border-b border-rule px-4 py-5">
                      <Badge variant={getStoryStatusVariantService(story.status)}>{story.status}</Badge>
                    </td>
                    <td className="border-b border-rule px-4 py-5 text-sm text-ink-muted">
                      <p className="font-medium text-ink">{story.authorName}</p>
                      <p>{story.updatedAt}</p>
                    </td>
                    <td className="border-b border-rule px-4 py-5">
                      <div className="text-right">
                        <p className="text-2xl font-semibold tracking-tight text-ink">{story.viewCount}</p>
                        <p className="text-xs uppercase tracking-[0.14em] text-ink-muted">Views</p>
                      </div>
                    </td>
                    <td className="border-b border-rule px-4 py-5">
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/stories/${story.id}`}>
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        </Link>
                        <Link href={`/stories/${story.id}/preview`}>
                          <Button size="sm" variant="ghost">
                            Preview
                          </Button>
                        </Link>
                        <Button onClick={() => handleRequestDeleteStory(story.id)} size="sm" variant="ghost">
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        confirmLabel="Delete Story"
        description={
          pendingDeleteStory
            ? `"${pendingDeleteStory.headline}" will be removed. This cannot be undone.`
            : ''
        }
        onCancel={handleCancelDeleteStory}
        onConfirm={handleConfirmDeleteStory}
        open={pendingDeleteId !== null}
        title="Delete this Story?"
        tone="danger"
      />
    </div>
  );
}
