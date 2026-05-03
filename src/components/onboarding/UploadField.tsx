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
}: UploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-bold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className={`max-w-full border-2 border-dashed rounded-2xl p-4 text-center transition-colors sm:p-6 ${
          error
            ? 'border-red-500 bg-red-50'
            : 'border-slate-200 bg-slate-50 hover:border-[color:var(--mdpl-accent)] dark:border-white/15 dark:bg-white/5'
        } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          name={name}
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled}
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
                  className="size-32 rounded-xl object-cover border border-slate-200"
                />
              ) : (
                <div className="size-32 rounded-xl bg-slate-200 flex items-center justify-center">
                  <Upload className="size-8 text-slate-400" />
                </div>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute -top-2 -right-2 size-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
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
            <Upload className="size-10 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-900">Drag & drop or click to upload</p>
            <p className="text-xs text-slate-500 mt-1">Supports {accept}</p>
          </>
        )}
      </div>
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
      {helperText && !error && <p className="text-slate-500 text-xs">{helperText}</p>}
    </div>
  );
}