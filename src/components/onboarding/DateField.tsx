import React from 'react';

interface DateFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  className?: string;
  max?: string;
  min?: string;
}

export function DateField({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  helperText,
  className = '',
  max,
  min,
}: DateFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={name} className="text-sm font-bold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        max={max}
        min={min}
        className={`w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0 ${
          error ? 'border-red-500' : ''
        }`}
      />
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
      {helperText && !error && <p className="text-slate-500 text-xs">{helperText}</p>}
    </div>
  );
}