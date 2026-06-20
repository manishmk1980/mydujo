import React, { useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

interface UploadFieldProps {
  label: string;
  name: string;
  value: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  className?: string;
  previewUrl?: string | null;
  uploading?: boolean;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export function UploadField({
  label,
  name,
  value,
  onChange,
  accept = 'image/*',
  error,
  required = false,
  disabled = false,
  helperText,
  className = '',
  previewUrl,
  uploading = false,
  containerRef,
}: UploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const errorId = `${name}-error`;
  const helperId = `${name}-helper`;
  const inputId = `${name}-input`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
  };

  const handleRemove = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div ref={containerRef} className={`space-y-2 ${className}`}>
      <label htmlFor={inputId} className="text-sm font-bold text-slate-700 dark:text-slate-200">
        {label} {required && <span className="text-red-500" aria-hidden="true">*</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      <div
        className={`max-w-full rounded-2xl border-2 border-dashed p-4 text-center transition-colors sm:p-6 ${
          error
            ? 'border-red-500 bg-red-50'
            : 'border-slate-200 bg-slate-50 hover:border-[color:var(--mdpl-accent)] dark:border-white/15 dark:bg-white/5'
        } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        onClick={() => !disabled && fileInputRef.current?.click()}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
      >
        <input
          ref={fileInputRef}
          id={inputId}
          type="file"
          name={name}
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled}
          aria-required={required || undefined}
          className="hidden"
        />
        {uploading ? (
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="mb-2 size-8 animate-spin text-[color:var(--mdpl-accent)]" />
            <p className="text-sm text-slate-600">Uploading...</p>
          </div>
        ) : value || previewUrl ? (
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="size-32 rounded-xl border border-slate-200 object-cover"
                />
              ) : (
                <div className="flex size-32 items-center justify-center rounded-xl bg-slate-200">
                  <Upload className="size-8 text-slate-400" />
                </div>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute -right-2 -top-2 flex size-8 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                aria-label={`Remove ${label}`}
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="max-w-full truncate px-1 text-sm font-medium text-slate-900 dark:text-white">
              {value?.name || 'Uploaded file'}
            </p>
            <p className="text-xs text-slate-500">Click to change</p>
          </div>
        ) : (
          <>
            <Upload className="mx-auto mb-3 size-10 text-slate-400" />
            <p className="text-sm font-medium text-slate-900">Drag & drop or click to upload</p>
            <p className="mt-1 text-xs text-slate-500">Supports JPG, PNG, WebP, or PDF (max 8MB)</p>
          </>
        )}
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
