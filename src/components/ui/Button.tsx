import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Spinner } from './Loader';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'savings';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary hover:opacity-90',
  secondary: 'bg-surface border border-border text-text hover:bg-surface-muted',
  ghost: 'text-text hover:bg-surface-muted',
  danger: 'bg-danger text-white hover:opacity-90 dark:text-bg',
  savings: 'bg-savings text-white hover:opacity-90 dark:text-bg',
};

/** Classes d'un bouton, pour styler un lien comme un bouton sans les imbriquer. */
export function buttonClass(variant: Variant = 'primary', size: 'sm' | 'md' = 'md'): string {
  const sizing = size === 'sm' ? 'h-9 px-3 text-sm' : 'h-11 px-4';
  return `inline-flex items-center justify-center gap-2 rounded-xl font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${sizing} ${VARIANTS[variant]}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md';
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${buttonClass(variant, size)} ${className}`}
      {...props}
    >
      {loading ? <Spinner className="size-4" /> : icon}
      {children}
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Libellé lu par les lecteurs d'écran */
  label: string;
}

export function IconButton({ label, className = '', children, type = 'button', ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`inline-flex size-10 items-center justify-center rounded-xl text-muted transition hover:bg-surface-muted hover:text-text ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
