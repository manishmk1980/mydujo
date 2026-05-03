import React, { type SelectHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../../lib/utils';

export interface AdminSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  options?: Array<{ value: string; label: string }>;
}

export function AdminSelect({
  label,
  helperText,
  error,
  leftIcon,
  size = 'md',
  fullWidth = true,
  className,
  id,
  children,
  options,
  disabled,
  ...props
}: AdminSelectProps) {
  const generatedId = React.useId();
  const selectId = id || generatedId;

  const sizeClasses = {
    sm: 'h-9 text-sm rounded-[calc(var(--admin-radius-control)-4px)] px-3',
    md: 'h-11 text-base rounded-[var(--admin-radius-control)] px-4',
    lg: 'h-14 text-lg rounded-[calc(var(--admin-radius-control)+4px)] px-5',
  };

  return (
    <div className={cn('space-y-2', fullWidth && 'w-full')}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-bold text-[var(--admin-text)]"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)] pointer-events-none">
            {leftIcon}
          </div>
        )}
        <select
          id={selectId}
          disabled={disabled}
          className={cn(
            'border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)] focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'appearance-none',
            'transition-colors',
            sizeClasses[size],
            leftIcon && 'pl-10',
            'pr-10',
            error && 'border-[var(--admin-danger)] focus:ring-[var(--admin-danger)]',
            fullWidth && 'w-full',
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)] pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>
      {(helperText || error) && (
        <p
          className={cn(
            'text-sm',
            error ? 'text-[var(--admin-danger)]' : 'text-[var(--admin-text-muted)]'
          )}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}