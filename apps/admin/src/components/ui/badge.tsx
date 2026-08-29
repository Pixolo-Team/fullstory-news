import type { HTMLAttributes, ReactNode } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary';
  children: ReactNode;
}

/**
 * Renders a compact status badge.
 */
export function Badge({
  variant = 'default',
  className = '',
  children,
  ...props
}: BadgeProps) {
  const variantClassName =
    variant === 'secondary'
      ? 'bg-paper-muted text-ink-muted border border-rule'
      : 'bg-accent text-paper';

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${variantClassName} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  );
}
