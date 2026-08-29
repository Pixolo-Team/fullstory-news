'use client';

import Link from 'next/link';
import { useAdminDemoContext } from '@/components/admin-demo-provider';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getDashboardDataService,
  getStoryStatusVariantService,
} from '@/services/get-admin-demo-data.service';

/**
 * Renders the live dashboard from the local dummy store.
 */
export function DashboardPageClient() {
  // Define Navigation

  // Define Context
  const { stories, categories } = useAdminDemoContext();

  // Define Refs

  // Define States

  // Helper Functions
  const dashboardData = getDashboardDataService(stories, categories);
  const topViews = stories.reduce((highestViews, story) => {
    const numericViews = Number(story.viewCount.replace(/,/g, ''));
    return numericViews > highestViews ? numericViews : highestViews;
  }, 0);

  // Use Effects
  return (
    <div className="space-y-6 lg:space-y-7">
      <PageHeader
        actions={
          <>
            <Link href="/stories/new">
              <Button>New Story</Button>
            </Link>
            <Link href="/categories">
              <Button variant="outline">Manage categories</Button>
            </Link>
          </>
        }
        description="A first-pass admin dashboard for reviewing hierarchy, layout, and primary editorial workflows."
        title="Overview"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardData.metrics.map((metric) => (
          <Card className="admin-metric-card" key={metric.label}>
            <CardHeader className="space-y-2 border-b-0 pb-0">
              <p className="admin-kicker">{metric.label}</p>
              <CardTitle className="text-4xl font-semibold tracking-tight lg:text-5xl">
                {metric.value}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2 text-sm leading-6 text-ink-muted">
              {metric.detail}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.85fr)]">
        <Card>
          <CardHeader className="flex flex-col gap-3 border-b border-rule lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="admin-kicker">Monitor</p>
              <CardTitle>Recent Stories</CardTitle>
              <CardDescription>
                Mix of published and draft Stories so the workflow feels realistic.
              </CardDescription>
            </div>
            <Link href="/stories">
              <Button size="sm" variant="outline">
                View all Stories
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData.stories.map((story) => (
              <div className="admin-soft-panel flex flex-col gap-4 rounded-2xl border border-rule p-5" key={story.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">
                      <span>{story.categoryName}</span>
                      <span className="h-1 w-1 rounded-full bg-rule" />
                      <span>{story.authorName}</span>
                    </div>
                    <p className="text-xl font-semibold tracking-tight text-ink">{story.headline}</p>
                    <p className="max-w-3xl text-sm leading-6 text-ink-muted">{story.subHeadline}</p>
                  </div>
                  <Badge variant={getStoryStatusVariantService(story.status)}>{story.status}</Badge>
                </div>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-ink-muted">
                    <span>Updated {story.updatedAt}</span>
                    <span>/{story.slug}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.16em] text-ink-muted">Views</p>
                    <p className="text-2xl font-semibold tracking-tight text-ink">{story.viewCount}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <p className="admin-kicker">Structure</p>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Quick view of public navigation groupings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData.categories.map((category) => (
                <div className="admin-soft-panel flex items-center justify-between rounded-2xl border border-rule p-4" key={category.id}>
                  <div className="space-y-1">
                    <p className="font-semibold text-ink">{category.name}</p>
                    <p className="text-sm text-ink-muted">/{category.slug}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold tracking-tight text-ink">
                      {category.storyCount}
                    </p>
                    <p className="text-xs uppercase tracking-[0.16em] text-ink-muted">Stories</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="admin-kicker">Publishing</p>
              <CardTitle>Editorial rhythm</CardTitle>
              <CardDescription>Local dummy actions update these numbers as you test the flows.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <div className="admin-soft-panel rounded-2xl border border-rule p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-ink-muted">Published</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">
                  {String(stories.filter((story) => story.status === 'published').length).padStart(2, '0')}
                </p>
              </div>
              <div className="admin-soft-panel rounded-2xl border border-rule p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-ink-muted">Awaiting review</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">
                  {String(stories.filter((story) => story.status === 'draft').length).padStart(2, '0')}
                </p>
              </div>
              <div className="admin-soft-panel rounded-2xl border border-rule p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-ink-muted">Top views</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">
                  {topViews.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
