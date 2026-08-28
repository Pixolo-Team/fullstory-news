import type { ReactNode, SelectHTMLAttributes } from 'react';
import { ChevronDownIcon } from '@/components/admin-icons';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}

/**
 * Renders a styled select field for admin filters and forms.
 */
export function Select({ className = '', children, ...props }: SelectProps) {
  return (
    <div className={`admin-select-wrapper ${className}`.trim()}>
      <select className="admin-select" {...props}>
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
    </div>
  );
}
