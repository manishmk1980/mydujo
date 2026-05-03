import React, { ReactNode } from 'react';

interface AdminAuthButtonProps {
  children: ReactNode;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  iconRight?: ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function AdminAuthButton({
  children,
  type = 'button',
  disabled = false,
  loading = false,
  iconRight,
  onClick,
  className = '',
}: AdminAuthButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 transition-all ${className} ${
        disabled || loading
          ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-[var(--admin-primary-hover)] to-[var(--admin-primary)] text-white hover:opacity-95 hover:shadow-xl hover:shadow-[color-mix(in_srgb,var(--admin-primary)_35%,transparent)]'
      }`}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Processing...</span>
        </>
      ) : (
        <>
          <span className="font-display uppercase tracking-[0.05em]">{children}</span>
          {iconRight && <span>{iconRight}</span>}
        </>
      )}
    </button>
  );
}