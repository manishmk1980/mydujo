import React from 'react';

interface CheckboxFieldProps {
  label: React.ReactNode;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  className?: string;
  labelClassName?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function CheckboxField({
  label,
  name,
  checked,
  onChange,
  error,
  required = false,
  disabled = false,
  helperText,
  className = '',
  labelClassName = '',
  inputRef,
}: CheckboxFieldProps) {
  const errorId = `${name}-error`;
  const helperId = `${name}-helper`;

  return (
    <div className={`min-w-0 space-y-2 ${className}`}>
      <div className="flex min-w-0 items-start gap-3">
        <input
          ref={inputRef}
          id={name}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          aria-required={required || undefined}
          className="mt-1 h-4 w-4 shrink-0 rounded text-[color:var(--mdpl-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mdpl-accent)]"
        />
        <label
          htmlFor={name}
          className={`min-w-0 flex-1 break-words text-sm leading-relaxed text-slate-600 dark:text-white/75 ${labelClassName}`}
        >
          {label} {required && <span className="text-red-500" aria-hidden="true">*</span>}
          {required && <span className="sr-only"> (required)</span>}
        </label>
      </div>
      {error ? (
        <p id={errorId} className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {helperText && !error ? <p id={helperId} className="text-xs text-slate-500">{helperText}</p> : null}
    </div>
  );
}
