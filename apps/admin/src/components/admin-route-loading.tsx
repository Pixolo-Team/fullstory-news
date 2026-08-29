// SERVICES //
import { Card, CardContent } from '@/components/ui/card';

interface AdminRouteLoadingProps {
  title: string;
  description: string;
}

/**
 * Renders a shared loading skeleton while admin routes fetch fresh server data.
 */
export function AdminRouteLoading({ title, description }: AdminRouteLoadingProps) {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-8">
      <div className="space-y-3 pb-2">
        <div className="h-3 w-24 animate-pulse rounded-full bg-accent-soft" />
        <div className="h-10 w-56 animate-pulse rounded-full bg-paper-elevated" />
        <div className="h-4 w-full max-w-2xl animate-pulse rounded-full bg-paper-elevated" />
        <p className="sr-only">
          Loading {title}. {description}
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card className="admin-metric-card" key={`metric-${index}`}>
            <CardContent className="space-y-4 py-6">
              <div className="h-3 w-24 animate-pulse rounded-full bg-paper-muted" />
              <div className="h-10 w-20 animate-pulse rounded-full bg-paper-elevated" />
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardContent className="space-y-4 py-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="h-5 w-40 animate-pulse rounded-full bg-paper-elevated" />
            <div className="h-8 w-24 animate-pulse rounded-full bg-paper-muted" />
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px]">
            <div className="h-11 animate-pulse rounded-xl bg-paper-muted" />
            <div className="h-11 animate-pulse rounded-xl bg-paper-muted" />
          </div>

          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                className="grid gap-3 rounded-2xl border border-rule p-4 lg:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr]"
                key={`row-${index}`}
              >
                <div className="space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded-full bg-paper-elevated" />
                  <div className="h-3 w-full animate-pulse rounded-full bg-paper-muted" />
                </div>
                <div className="h-4 w-24 animate-pulse rounded-full bg-paper-muted" />
                <div className="h-4 w-20 animate-pulse rounded-full bg-paper-muted" />
                <div className="h-9 w-24 animate-pulse rounded-full bg-paper-elevated" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
