import React, { type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../../lib/utils';

export interface AdminInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function AdminInput({
  label,
  helperText,
  error,
  leftIcon,
  rightIcon,
  size = 'md',
  fullWidth = true,
  className,
  id,
  disabled,
  ...props
}: AdminInputProps) {
  const generatedId = React.useId();
  const inputId = id || generatedId;

  const sizeClasses = {
    sm: 'h-9 text-sm rounded-[calc(var(--admin-radius-control)-4px)] px-3',
    md: 'h-11 text-base rounded-[var(--admin-radius-control)] px-4',
    lg: 'h-14 text-lg rounded-[calc(var(--admin-radius-control)+4px)] px-5',
  };

  return (
    <div className={cn('space-y-2', fullWidth && 'w-full')}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-bold text-[var(--admin-text)]"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          disabled={disabled}
          className={cn(
            'border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text)]',
            'placeholder:text-[var(--admin-text-muted)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)] focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors',
            sizeClasses[size],
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-[var(--admin-danger)] focus:ring-[var(--admin-danger)]',
            fullWidth && 'w-full',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]">
            {rightIcon}
          </div>
        )}
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