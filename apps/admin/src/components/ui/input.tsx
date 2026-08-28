import type { InputHTMLAttributes } from 'react';

/**
 * Renders a text input with shared admin styling.
 */
export function Input({ className = '', type = 'text', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-10 w-full rounded-md border border-rule bg-paper px-3 text-sm text-ink outline-none transition placeholder:text-ink-muted focus:border-accent ${className}`.trim()}
      type={type}
      {...props}
    />
  );
}
