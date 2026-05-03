import React, { type ButtonHTMLAttributes } from 'react';
import { cn } from '../../../lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'warning' | 'success';
type Size = 'sm' | 'md' | 'lg';

export interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-[var(--admin-primary)] text-white hover:bg-[var(--admin-primary-hover)] shadow-sm border border-transparent disabled:opacity-50',
  secondary: 'bg-[var(--admin-surface)] text-[var(--admin-text)] border border-[var(--admin-border)] hover:bg-[var(--admin-surface-soft)] disabled:opacity-50',
  ghost: 'text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface-soft)] border border-transparent disabled:opacity-50',
  danger: 'bg-[var(--admin-danger)] text-white hover:opacity-90 border border-transparent disabled:opacity-50',
  warning: 'bg-[var(--admin-warning)] text-white hover:opacity-90 border border-transparent disabled:opacity-50',
  success: 'bg-[var(--admin-success)] text-white hover:opacity-90 border border-transparent disabled:opacity-50',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-2 text-xs rounded-[var(--admin-radius-control)] gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-[var(--admin-radius-control)] gap-2',
  lg: 'px-5 py-3 text-sm rounded-2xl gap-2',
};

export function AdminButton({
  className,
  variant = 'primary',
  size = 'md',
  type = 'button',
  leftIcon,
  rightIcon,
  loading,
  disabled,
  children,
  ...props
}: AdminButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-bold transition-colors font-['Space_Grotesk',sans-serif] disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
}
