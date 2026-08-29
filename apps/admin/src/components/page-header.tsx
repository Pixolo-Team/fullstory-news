import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  actions?: ReactNode;
}

/**
 * Renders a standard page title row with optional actions.
 */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-1 flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-ink-muted">Workspace</p>
        <h1 className="text-3xl font-semibold tracking-tight text-ink lg:text-4xl">{title}</h1>
        <p className="max-w-3xl text-sm leading-6 text-ink-muted">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
