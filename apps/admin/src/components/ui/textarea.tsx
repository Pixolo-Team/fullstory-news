import type { TextareaHTMLAttributes } from 'react';

/**
 * Renders a textarea with shared admin styling.
 */
export function Textarea({
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`min-h-32 w-full rounded-md border border-rule bg-paper px-3 py-2 text-sm text-ink outline-none transition placeholder:text-ink-muted focus:border-accent ${className}`.trim()}
      {...props}
    />
  );
}
