'use client';

// TYPES //
import type { ArticleData, PaginatedData } from '@/types/api.types';
import type { FormEvent } from 'react';

// SERVICES //
import { deleteArticleAction } from '@/app/actions/article.actions';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { formatDateService } from '@/services/format-date.service';
import { getArticleStatusVariantService } from '@/services/get-article-status-variant.service';
import { useToast } from '@/components/ui/toast';

// CONSTANTS //
import { EMPTY_ACTION_RESULT } from '@/types/action-result.types';

// LIBRARIES //
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useRef, useState } from 'react';

interface StoriesPageClientProps {
  articles: PaginatedData<ArticleData>;
  searchQuery: string;
  statusFilter: string;
}

/**
 * Renders the Story list.
 *
 * Filtering runs on the server through the URL, so a filtered view can be
 * linked to, reloaded and paginated without losing state.
 */
export function StoriesPageClient({ articles, searchQuery, statusFilter }: StoriesPageClientProps) {
  // Define Navigation
  const router = useRouter();

  // Define Context
  const { showToast } = useToast();

  // Define Refs
  const deleteFormRef = useRef<HTMLFormElement>(null);

  // Define States
  const [searchInput, setSearchInput] = useState<string>(searchQuery);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleteState, submitDelete] = useActionState(deleteArticleAction, EMPTY_ACTION_RESULT);

  // Helper Functions
  const publishedCount = articles.items.filter((article) => article.status === 'published').length;
  const draftCount = articles.items.length - publishedCount;
  const pendingDeleteArticle =
    articles.items.find((article) => article.id === pendingDeleteId) ?? null;

  /**
   * Pushes the current filters into the URL so the server refetches.
   */
  const applyFilters = (nextQuery: string, nextStatus: string): void => {
    const searchParams = new URLSearchParams();

    if (nextQuery.trim()) {
      searchParams.set('q', nextQuery.trim());
    }

    if (nextStatus !== 'all') {
      searchParams.set('status', nextStatus);
    }

    const query = searchParams.toString();
    router.push(query ? `/stories?${query}` : '/stories');
  };

  /**
   * Applies the search box on submit.
   */
  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    applyFilters(searchInput, statusFilter);
  };

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
   * Submits the hidden form so the delete runs as a server action.
   */
  const handleConfirmDeleteStory = (): void => {
    deleteFormRef.current?.requestSubmit();
    setPendingDeleteId(null);
  };

  // Use Effects
  useEffect(() => {
    if (deleteState.errorMessage) {
      showToast({
        title: 'Could not delete Story',
        description: deleteState.errorMessage,
        tone: 'error',
      });
    }

    if (deleteState.successMessage) {
      showToast({ title: deleteState.successMessage, tone: 'success' });
    }
  }, [deleteState, showToast]);

  return (
    <div className="space-y-8">
      <PageHeader
        actions={
          <Link href="/stories/new">
            <Button>New Story</Button>
          </Link>
        }
        description="Every Story in the newsroom, with the actions editors need most often."
        title="Stories"
      />

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="admin-metric-card">
          <CardContent className="py-6">
            <p className="admin-kicker">All Stories</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-ink">{articles.total}</p>
          </CardContent>
        </Card>
        <Card className="admin-metric-card">
          <CardContent className="py-6">
            <p className="admin-kicker">Published on this page</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-ink">{publishedCount}</p>
          </CardContent>
        </Card>
        <Card className="admin-metric-card">
          <CardContent className="py-6">
            <p className="admin-kicker">Drafts on this page</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-ink">{draftCount}</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="flex flex-col gap-4 border-b border-rule lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="admin-kicker">Manage</p>
            <CardTitle>Story list</CardTitle>
            <CardDescription>
              Page {articles.page} of {Math.max(articles.totalPages, 1)}
            </CardDescription>
          </div>
          <div className="rounded-full border border-rule bg-paper-muted px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
            {articles.total} items
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <form
            className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px]"
            onSubmit={handleSearchSubmit}
          >
            <Input
              aria-label="Search Stories"
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by headline or sub-headline"
              value={searchInput}
            />
            <Select
              aria-label="Filter by status"
              onChange={(event) => applyFilters(searchInput, event.target.value)}
              value={statusFilter}
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </Select>
          </form>

          {articles.items.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-muted">No Stories match this view.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                  <tr className="text-left text-sm text-ink-muted">
                    <th className="border-b border-rule px-4 py-3 font-medium">Story</th>
                    <th className="border-b border-rule px-4 py-3 font-medium">Category</th>
                    <th className="border-b border-rule px-4 py-3 font-medium">Status</th>
                    <th className="border-b border-rule px-4 py-3 font-medium">Updated</th>
                    <th className="border-b border-rule px-4 py-3 font-medium">Views</th>
                    <th className="w-px whitespace-nowrap border-b border-rule px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.items.map((article) => (
                    <tr className="align-top" key={article.id}>
                      <td className="border-b border-rule px-4 py-5">
                        <div className="space-y-1">
                          <p className="text-base font-semibold text-ink">{article.headline}</p>
                          <p className="max-w-2xl text-sm leading-6 text-ink-muted">
                            {article.subHeadline}
                          </p>
                          <p className="text-xs uppercase tracking-[0.12em] text-ink-muted">
                            /{article.slug}
                          </p>
                        </div>
                      </td>
                      <td className="border-b border-rule px-4 py-5 text-sm font-medium text-ink">
                        {article.category.name}
                      </td>
                      <td className="border-b border-rule px-4 py-5">
                        <Badge variant={getArticleStatusVariantService(article.status)}>
                          {article.status}
                        </Badge>
                      </td>
                      <td className="border-b border-rule px-4 py-5 text-sm text-ink-muted">
                        <p className="font-medium text-ink">{article.author.name}</p>
                        <p>{formatDateService(article.updatedAt)}</p>
                      </td>
                      <td className="border-b border-rule px-4 py-5">
                        <div className="text-right">
                          <p className="text-2xl font-semibold tracking-tight text-ink">
                            {article.viewCount.toLocaleString()}
                          </p>
                          <p className="text-xs uppercase tracking-[0.14em] text-ink-muted">Views</p>
                        </div>
                      </td>
                      <td className="w-px whitespace-nowrap border-b border-rule px-4 py-5">
                        <div className="flex flex-nowrap items-center gap-2">
                          <Link href={`/stories/${article.id}`}>
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          </Link>
                          <Button
                            onClick={() => handleRequestDeleteStory(article.id)}
                            size="sm"
                            variant="ghost"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <form action={submitDelete} className="hidden" ref={deleteFormRef}>
        <input name="id" type="hidden" value={pendingDeleteId ?? ''} readOnly />
      </form>

      <ConfirmDialog
        confirmLabel="Delete Story"
        description={
          pendingDeleteArticle
            ? `"${pendingDeleteArticle.headline}" will be removed. This cannot be undone.`
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
