import type { LabelHTMLAttributes, ReactNode } from 'react';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
}

/**
 * Renders a form label with shared admin styling.
 */
export function Label({ className = '', children, ...props }: LabelProps) {
  return (
    <label className={`text-sm font-medium text-ink ${className}`.trim()} {...props}>
      {children}
    </label>
  );
}
