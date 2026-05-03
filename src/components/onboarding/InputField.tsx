import React from 'react';

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  className?: string;
  inputClassName?: string;
}

export function InputField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  helperText,
  className = '',
  inputClassName = '',
}: InputFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={name} className="text-sm font-bold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`mdpl-onboarding-input border-slate-200 ${error ? 'border-red-500' : ''} ${inputClassName}`}
      />
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
      {helperText && !error && <p className="text-slate-500 text-xs">{helperText}</p>}
    </div>
  );
}