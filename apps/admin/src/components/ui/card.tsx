import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * Renders a bordered panel container.
 */
export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-rule bg-paper ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Renders the header area for a card.
 */
export function CardHeader({ className = '', children, ...props }: CardProps) {
  return (
    <div className={`space-y-1.5 border-b border-rule px-6 py-5 ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

/**
 * Renders a primary heading inside a card.
 */
export function CardTitle({ className = '', children, ...props }: CardProps) {
  return (
    <h2 className={`text-lg font-semibold text-ink ${className}`.trim()} {...props}>
      {children}
    </h2>
  );
}

/**
 * Renders supporting copy inside a card header.
 */
export function CardDescription({ className = '', children, ...props }: CardProps) {
  return (
    <p className={`text-sm text-ink-muted ${className}`.trim()} {...props}>
      {children}
    </p>
  );
}

/**
 * Renders the content area for a card.
 */
export function CardContent({ className = '', children, ...props }: CardProps) {
  return (
    <div className={`px-6 py-5 ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}
