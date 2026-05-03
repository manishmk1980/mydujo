import React, { ReactNode } from 'react';

interface AdminAuthFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon?: ReactNode;
  rightElement?: ReactNode;
  autoComplete?: string;
  required?: boolean;
  name?: string;
  id?: string;
  disabled?: boolean;
  error?: boolean;
}

export default function AdminAuthField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon,
  rightElement,
  autoComplete,
  required = false,
  name,
  id,
  disabled = false,
  error = false,
}: AdminAuthFieldProps) {
  const fieldId = id || name || `field-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="space-y-2">
      <label
        htmlFor={fieldId}
        className="text-sm font-bold text-slate-300 ml-1 uppercase tracking-[0.1em] font-display"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
            {icon}
          </div>
        )}
        <input
          id={fieldId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          name={name}
          disabled={disabled}
          className={`w-full ${icon ? 'pl-12' : 'pl-4'} ${rightElement ? 'pr-12' : 'pr-4'} py-3.5 bg-white/[0.06] border ${error ? 'border-red-500/50' : 'border-white/12'} rounded-2xl text-white placeholder-slate-500 focus:border-[var(--admin-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--admin-primary)_25%,transparent)] outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
}