'use client';

// TYPES //
import type { ArticleData, DashboardStatsData } from '@/types/api.types';

// SERVICES //
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateService } from '@/services/format-date.service';
import { getArticleStatusVariantService } from '@/services/get-article-status-variant.service';

// LIBRARIES //
import Link from 'next/link';

interface DashboardPageClientProps {
  stats: DashboardStatsData;
  recentArticles: ArticleData[];
}

/**
 * Renders the dashboard overview from backend data.
 */
export function DashboardPageClient({ stats, recentArticles }: DashboardPageClientProps) {
  // Define Navigation

  // Define Context

  // Define Refs

  // Define States

  // Helper Functions
  const metrics = [
    { label: 'All Stories', value: stats.totalArticles },
    { label: 'Published', value: stats.publishedArticles },
    { label: 'Drafts', value: stats.draftArticles },
    { label: 'Categories', value: stats.totalCategories },
  ];

  // Use Effects

  return (
    <div className="space-y-6 lg:space-y-7">
      <PageHeader
        actions={
          <Link href="/stories/new">
            <Button>New Story</Button>
          </Link>
        }
        description="What is published, what is waiting, and what changed most recently."
        title="Dashboard"
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card className="admin-metric-card" key={metric.label}>
            <CardContent className="py-6">
              <p className="admin-kicker">{metric.label}</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-ink">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader className="border-b border-rule">
          <p className="admin-kicker">Recent</p>
          <CardTitle>Latest activity</CardTitle>
          <CardDescription>The Stories changed most recently.</CardDescription>
        </CardHeader>

        <CardContent>
          {recentArticles.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-muted">
              No Stories yet.{' '}
              <Link className="text-accent underline-offset-4 hover:underline" href="/stories/new">
                Write the first one
              </Link>
              .
            </p>
          ) : (
            <ul className="divide-y divide-rule">
              {recentArticles.map((article) => (
                <li className="flex flex-wrap items-start justify-between gap-4 py-4" key={article.id}>
                  <div className="min-w-0 space-y-1">
                    <Link
                      className="text-base font-semibold text-ink underline-offset-4 hover:underline"
                      href={`/stories/${article.id}`}
                    >
                      {article.headline}
                    </Link>
                    <p className="text-sm text-ink-muted">
                      {article.category.name} · {formatDateService(article.updatedAt)}
                    </p>
                  </div>
                  <Badge variant={getArticleStatusVariantService(article.status)}>
                    {article.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
