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
}: CheckboxFieldProps) {
  return (
    <div className={`min-w-0 space-y-2 ${className}`}>
      <div className="flex min-w-0 items-start gap-3">
        <input
          id={name}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="mt-1 h-4 w-4 shrink-0 rounded text-[color:var(--mdpl-accent)] focus:ring-[color:var(--mdpl-accent)]"
        />
        <label
          htmlFor={name}
          className={`min-w-0 flex-1 break-words text-sm leading-relaxed text-slate-600 dark:text-white/75 ${labelClassName}`}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      </div>
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
      {helperText && !error && <p className="text-slate-500 text-xs">{helperText}</p>}
    </div>
  );
}