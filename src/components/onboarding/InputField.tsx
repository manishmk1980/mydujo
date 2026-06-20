import React from 'react';

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  className?: string;
  inputClassName?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  autoComplete?: string;
}

export function InputField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required = false,
  disabled = false,
  helperText,
  className = '',
  inputClassName = '',
  inputRef,
  autoComplete,
}: InputFieldProps) {
  const errorId = `${name}-error`;
  const helperId = `${name}-helper`;

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={name} className="text-sm font-bold text-slate-700 dark:text-slate-200">
        {label} {required && <span className="text-red-500" aria-hidden="true">*</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      <input
        ref={inputRef}
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        aria-required={required || undefined}
        className={`mdpl-onboarding-input border-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mdpl-accent)] ${error ? 'border-red-500' : ''} ${inputClassName}`}
      />
      {error ? (
        <p id={errorId} className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {helperText && !error ? <p id={helperId} className="text-xs text-slate-500">{helperText}</p> : null}
    </div>
  );
}
