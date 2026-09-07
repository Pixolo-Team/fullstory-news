import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm';
  children: ReactNode;
}

/**
 * Renders a shadcn-style button using the repo's neutral design tokens.
 */
export function Button({
  variant = 'default',
  size = 'default',
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  // --color-paper and --color-paper-muted sit almost on top of each other in
  // dark mode, so a hover that only swapped between them (or dimmed opacity
  // by 5%) read as no hover at all there. accent-soft/accent-hover are real
  // color shifts in both themes.
  const variantClassName =
    variant === 'outline'
      ? 'border border-rule bg-paper text-ink hover:border-accent hover:bg-accent-soft hover:text-accent'
      : variant === 'ghost'
        ? 'bg-transparent text-ink hover:bg-accent-soft hover:text-accent'
        : 'bg-accent text-paper hover:bg-accent-hover';

  // A disabled button must stop looking pressable: no hover, dimmed, and a
  // cursor that says so. Without this a submitting button looks live.
  const disabledClassName =
    'disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-transparent disabled:bg-disabled disabled:text-disabled-fg';

  const sizeClassName = size === 'sm' ? 'h-9 px-3 text-sm' : 'h-10 px-4 text-sm';

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition ${variantClassName} ${sizeClassName} ${disabledClassName} ${className}`.trim()}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
