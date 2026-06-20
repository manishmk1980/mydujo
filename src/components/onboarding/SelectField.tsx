import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: Option[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  className?: string;
  selectClassName?: string;
  selectRef?: React.RefObject<HTMLSelectElement | null>;
}

export function SelectField({
  label,
  name,
  value,
  onChange,
  onBlur,
  options,
  placeholder = 'Select an option',
  error,
  required = false,
  disabled = false,
  helperText,
  className = '',
  selectClassName = '',
  selectRef,
}: SelectFieldProps) {
  const errorId = `${name}-error`;
  const helperId = `${name}-helper`;

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={name} className="text-sm font-bold text-slate-700 dark:text-slate-200">
        {label} {required && <span className="text-red-500" aria-hidden="true">*</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      <select
        ref={selectRef}
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        aria-required={required || undefined}
        className={`mdpl-onboarding-input border-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mdpl-accent)] ${
          error ? 'border-red-500' : ''
        } ${selectClassName}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={errorId} className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {helperText && !error ? <p id={helperId} className="text-xs text-slate-500">{helperText}</p> : null}
    </div>
  );
}
